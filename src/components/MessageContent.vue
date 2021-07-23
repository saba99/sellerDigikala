<template>
    <div>
        <loading v-if="showLoading"></loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 


        <div class="panel" v-if="messageContent!=null">
            
            <div class="header">
               جزییات پیام - {{ messageContent.title }}
            </div>
            <div class="panel_content">

                <div v-if="show_alert_message" style="margin-bottom:10px" class="alert alert-success alert-dismissible fade show" role="alert">
                   <span>{{ alert_message }}</span>
                   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                   </button>
                </div>

                <div class="question_div">
                    <div class="question_div_header">
                        <div>
                          <span v-if="messageContent.from!=null">
                             <span v-if="messageContent.from_type=='App\\User'" class="form_link">
                                ارسال کننده : {{ $siteName }}
                             </span>
                             <span v-else class="form_link">
                                  ارسال کننده :  {{ messageContent.from.brand_name }}
                             </span>
                          </span>
                          <span v-else class="form_link"> ارسال کننده : {{ $siteName }} </span>
                        </div>
                        <div>
                           {{ getTime(messageContent.time)}} - {{ getDate(messageContent.time,true)}}
                        </div>
                    </div>
                    <div class="question_content">
                       <div v-html="messageContent.content"></div>
                       <div v-if="messageContent.file!=null" class="attached-file">
                           <span>فایل ضمیمه شده : </span>
                           <a :href="$siteUrl+'/files/upload/'+messageContent.file" target="_blank">
                              {{ messageContent.file }}
                           </a>
                       </div>
                    </div>
                </div>

                <div v-if="messageContent!=null">
                  <div class="question_div" v-for="answer in messageContent.get_answer" :key="answer.id">
                    <div class="question_div_header">
                        <div>
                          <span v-if="answer.from_type=='App\\Seller'" class="to_link">
                            شما
                          </span>
                          <span v-else class="form_link"> ارسال کننده : {{ $siteName }} </span>
                        </div>
                        <div>
                           {{ getTime(answer.time)}} - {{ getDate(answer.time,true)}}
                        </div>
                    </div>
                    <div class="question_content">
                       <div v-html="answer.content"></div>
                       <div v-if="answer.file!=null" class="attached-file">
                           <span>فایل ضمیمه شده : </span>
                           <a :href="$siteUrl+'/files/upload/'+answer.file" target="_blank">
                              {{ answer.file }}
                           </a>
                       </div>
                    </div>
                  </div>
                </div>
                <div style="margin-top:40px">
                  <span style="color:gray;">ارسال پاسخ</span>
                  <div v-if="errors.length>0" class="alert alert-warning">
                   <ul class="errors_ul">
                      <li :key="key" v-for="(error,key) in errors">{{ error[0] }}</li>
                   </ul>
                  </div>

                  <div class="form-group" style="margin-top:20px">
                    <textarea class="textArea" v-model="content" placeholder="پاسخ شما"></textarea>
                    <p v-if="content_error" style="padding-right:0px" class="has_error"> {{ content_error }}</p>
                  </div>

                  <div class="form-group">
                     <label>انتخاب فایل : </label>
                     <input type="file" ref="fileInput" v-on:change="selectFile" style="direction:ltr">
                  </div>

                  <div class="form-group">
                     <button class="btn btn-success" v-on:click="addAnswer()">ارسال پاسخ</button>
                  </div>
                </div>

            </div>
        </div>
       <server-error-message v-if="server_error"></server-error-message>  

    </div>
</template>

<script>
import myMinix from '../assets/myMixin';
export default {
    mixins:[myMinix],
    data()
    {
        return {
            show_product_list:false,
            server_error:false,
            showLoading:true,
            messageContent:null,
            BreadcrumbList:[
              { path:'/messages',title:'مدیریت پیام ها' },
              { path:'/messages/'+this.$route.params.id+'/show',title:'جزییات پیام' },
            ],
            account_status:'active',
            show_alert_message:false,
            alert_message:'',
            message_id:0,
            content_error:false,
            content:'',
            image:'',
            send_form:true,
            errors:[]
        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','messages');
        this.message_id=this.$route.params.id;
        this.getMessageContent();
    },
    methods:{
        getMessageContent:function()
        {
            this.showLoading=true;
            const url=this.$siteUrl+'/api/seller/messages/content/'+this.message_id;
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                   if(response.data=='redirect'){
                     this.$router.push({name:'MessageList'});
                   }
                   else{
                     this.messageContent=response.data;
                   } 
                }
                
            }).catch((error)=>{
                this.setCatch(error);
            });
        },
        selectFile:function(){
            this.image=this.$refs.fileInput.files[0];
        },
        addAnswer:function(){
            if(this.send_form){
                const check_content=this.validate_field('محتوای پیام',this.content,'content_error');
                if(check_content){
                    this.errors=[]
                    this.showLoading=true;
                    this.send_form=false;
                    const url=this.$siteUrl+'/api/seller/message/'+this.message_id+'/answer';
                    const formData=new FormData();
                    formData.append('content',this.content);
                    if(this.image!=""){
                      formData.append('pic',this.image);
                    }
                    this.axios.post(url,formData,this.setHeader(true)).then(response=>{
                        this.showLoading=false;
                        this.send_form=true;
                        const result=this.setAccountStatus(response.data);
                        if(result)
                        {
                            if(response.data.status=="error")
                            { 
                                const errors=response.data.errors;
                                const keys=Object.keys(errors);
                                for(var i=0;i<keys.length;i++)
                                {
                                    this.errors.push(errors[keys[i]]);
                                }
                            }
                            else if(response.data.status=="ok")
                            {
                                this.content='';
                                this.image='';
                                this.show_alert_message=true;
                                this.alert_message='ثبت پاسخ با موفقیت انجام شد';
                                this.messageContent.get_answer.push(response.data.answer);
                            }
                            else{
                                this.show_server_error();
                            }
                        }
                    }).catch((error) => {
                        this.send_form=true;
                        this.setCatch(error);
                    });
                }
            }
        },
          validate_field:function (label,field_name,field_error,field_length){

            if (field_name.toString().trim().length == 0) {
                const text = 'لطفا ' + label + ' خود را وارد نمایید';
                this[field_error] = text;
                return false;
            }
            else if (field_length != undefined && field_name.trim().length < field_length) {
                const text = '' + label + ' باید حداقل شامل ' + field_length + ' کاراکتر باشد';
                this[field_error] = text;
                return false;
            }
            else {
                this[field_error] = false;
                return true;
            }
        },setHeader: function (image) {
            const token = localStorage.getItem('token');
            if (image) {
                return {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'multipart/form-data'
                    }
                };
            }
            else {
                return {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                };
            }
        },setCatch: function (error) {
            this.showLoading = false;
            if (error.response) {
                if (error.response.status == 401) {
                    this.logout();
                }
                else {
                    this.show_server_error();
                }
            }
            else {
                this.show_server_error();
            }
        },setAccountStatus: function (data) {
            if (data.error_access == 'ok') {
                this.account_status = data.account_status;
                localStorage.setItem('account_status', data.account_status);
                return false;
            }
            else {
                this.account_status = 'active';
                localStorage.setItem('account_status', 'active');
                return true;
            }
        },getRow: function (n, count) {
            count = count == undefined ? 10 : count;
            var row = n + 1;
            row = row + (this.page - 1) * count;
            return this.replaceNumber(row);
        }, 
    getDate: function (time, format) {
        time = time * 1000;
        const date = new Date(time);
        let r = '';
        const jalali = this.gregorian_to_jalali(date.getFullYear(), (date.getMonth() + 1), date.getDate());
        if (format == undefined) {
            r = this.replaceNumber(jalali[2]) + " " + this.monthName[(jalali[1] - 1)] + " " + this.replaceNumber(jalali[0]);
        }
        else {
            r = this.replaceNumber(jalali[0]) + "/" + this.replaceNumber(jalali[1]) + "/" + this.replaceNumber(jalali[2]);
        }
        return r;
    },
    gregorian_to_jalali: function (gy, gm, gd) {
        var g_d_m, jy, jm, jd, gy2, days;
        g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        if (gy > 1600) {
            jy = 979;
            gy -= 1600;
        } else {
            jy = 0;
            gy -= 621;
        }
        gy2 = (gm > 2) ? (gy + 1) : gy;
        days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
        jy += 33 * (parseInt(days / 12053));
        days %= 12053;
        jy += 4 * (parseInt(days / 1461));
        days %= 1461;
        if (days > 365) {
            jy += parseInt((days - 1) / 365);
            days = (days - 1) % 365;
        }
        jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
        jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
        return [jy, jm, jd];
    },
getTime: function (time) {
        time = time * 1000;
        const date = new Date(time);
        let r = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return this.replaceNumber(r);
    },
    }
}
</script>

<style>

</style>