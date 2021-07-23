<template>
    <div>
        <loading v-if="showLoading"></loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 


        <div class="panel">
            
            <div class="header">
               مدیریت پیام ها

                <b-dropdown id="dropdown-1" text="گزینه ها" variant="btn">
                    <b-dd-item to='/messages/add'>
                        <span class="fa fa-pencil"></span>
                        <span>افزودن پیام جدید</span>
                    </b-dd-item>
                </b-dropdown>
            </div>
            <div class="panel_content">

                <div v-if="show_alert_message" style="margin-bottom:10px" class="alert alert-success alert-dismissible fade show" role="alert">
                   <span>{{ alert_message }}</span>
                   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                   </button>
                </div>

                <div class="product_search_div">  
                    <form method="get" class="search_form package_search_box">
                        <input type="text" class="form-control" v-model="search_text" placeholder="عنوان پیام">
                        <a class="btn btn-primary" v-on:click="getMessageList(1)" style="color:white">جست و جو</a>
                    </form>
                </div>
            

                <table class="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>ردیف</th>
                        <th>عنوان</th>
                        <th>ارسال کننده</th>
                        <th>دریافت کننده</th>
                        <th>زمان ارسال</th>
                        <th>عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(message,key) in messageList.data" :key="message.id">
                           <td>{{ getRow(key) }}</td>
                           <td>{{ message.title }}</td> 
                           <td>
                               <span v-if="message.from!=null">
                                   <span v-if="message.from_type=='App\\User'" class="form_link">
                                      {{ $siteName }}
                                   </span>
                                   <span v-else class="form_link">
                                       {{ message.from.brand_name }}
                                   </span>
                               </span>
                               <span v-else class="form_link"> {{ $siteName }}</span>
                           </td>
                            <td>
                              <span v-if="message.to!=null">
                                   <span v-if="message.to_type=='App\\User'" class="to_link">
                                       {{ $siteName }}
                                   </span>
                                   <span v-else class="to_link">
                                       {{ message.to.brand_name }}
                                   </span>
                               </span>
                               <span v-else class="to_link"> {{ $siteName }}</span>
                            </td>
                            <td>
                               {{ getTime(message.time)}} - {{ getDate(message.time,true)}}
                            </td>
                            <td>
                                <span :class="[ message.status==-1 ? 'fa fa-eye red' : 'fa fa-eye']"  v-on:click="$router.push({name:'MessageContent',params:{id:message.id}})"></span>
                            </td>
                        </tr>
                        <tr v-if="messageList.data.length==0">
                            <td colspan="6">رکوردی یافت نشد</td>
                        </tr>
                    </tbody>
                </table>

                <pagination :data="messageList" @pagination-change-page="getMessageList"></pagination>

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
            messageList:{data:[]},
            BreadcrumbList:[
                { path:'/messages',title:'مدیریت پیام ها' },
            ],
            page:1,
            account_status:'active',
            show_alert_message:false,
            alert_message:'',
            search_text:''
        }
    },
    mounted(){
        this.seller_id=localStorage.getItem('seller_id');
        if(this.$route.params.success=='ok')
        {
            this.show_alert_message=true;
            this.alert_message='پیام شما با موفقیت ثبت شد';
        }
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','messages');
        this.getMessageList();
    },
    methods:{
        getMessageList:function(page=1)
        {
            this.showLoading=true;
            this.page=page;
            const url=this.$siteUrl+'/api/seller/messages/list?page='+page+'&title='+this.search_text;
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    this.messageList=response.data;
                }
                
            }).catch((error)=>{
                this.setCatch(error);
            });
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
        },
        setCatch: function (error) {
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