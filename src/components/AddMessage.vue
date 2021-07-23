<template>
  <div>
      <loading v-if="showLoading"></loading>
      <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>

         <div class="panel">

             <div class="header">افزودن پیام جدید</div>

             <div class="panel_content">


               <div v-if="errors.length>0" class="alert alert-warning">
                   <ul class="errors_ul">
                      <li :key="key" v-for="(error,key) in errors">{{ error[0] }}</li>
                   </ul>
               </div>
               <div class="form-group">
                    <label>عنوان پیام : </label>
                    <input type="text" class="form-control" v-model="title">
                    <span v-if="title_error" class="has_error"> {{ title_error }}</span>
                </div>
                <div class="form-group">
                    <textarea class="textArea" v-model="content" placeholder="پیام شما"></textarea>
                    <p v-if="content_error" style="padding-right:0px" class="has_error"> {{ content_error }}</p>
                </div>

                <div class="form-group">
                    <label>انتخاب فایل : </label>
                    <input type="file" ref="fileInput" v-on:change="selectFile" style="direction:ltr">
                </div>

                <div class="form-group">
                     <button class="btn btn-success" v-on:click="addMessage()">ارسال پیام</button>
                </div>

             </div>

        </div>
      <server-error-message v-if="server_error"></server-error-message>  
  </div>
</template>

<script>

import myMixin from '../assets/myMixin';
import Loading from './Loading';
import ServerErrorMessage from './ServerErrorMessage'
export default {
   components:{Loading,ServerErrorMessage},
   mixins:[myMixin],
    data(){
        return{
            server_error:false,
            BreadcrumbList:[
                { path:'/messages',title:'مدیریت پیام ها' },
                 {path:'/messages/add',title:'افزودن پیام جدید'}
            ],
            showLoading:false,
            title:'',
            content:'',
            image:'',
            errors:[],
            send_form:true,
            title_error:false,
            content_error:false
        }
    },
    mounted(){
        this.$emit('setSideBarItem','messages');
    },
    methods:{
        selectFile:function(){
            this.image=this.$refs.fileInput.files[0];
        },
        addMessage:function(){
            if(this.send_form){
                const check_title=this.validate_field('عنوان پیام',this.title,'title_error');
                const check_content=this.validate_field('محتوای پیام',this.content,'content_error');
                if(check_title && check_content){
                    this.errors=[]
                    this.showLoading=true;
                    this.send_form=false;
                    const url=this.$siteUrl+'/api/seller/message/add';
                    const formData=new FormData();
                    formData.append('title',this.title);
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
                                this.$router.push({name:'MessageList',params:{success:'ok'}})
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
        },
    }
}
</script>

<style>

</style>