<template>
     <div>
           <div class="form-group">
               <label>انتخاب اسکن صفحه اصلی شناسنامه</label>
               <input type="file" ref="file_input1" v-on:change="set_file(1)">
               <div class="select_file_div" v-on:click="$refs.file_input1.click()">
                   <div class="title">انتخاب فایل</div>
                   <div class="file_name">{{ this.file1_name }}</div>
               </div>
           </div>
           <div class="form-group">
               <label>انتخاب اسکن کارت ملی</label>
               <input type="file" ref="file_input2" v-on:change="set_file(2)">
               <div class="select_file_div" v-on:click="$refs.file_input2.click()">
                   <div class="title">انتخاب فایل</div>
                   <div class="file_name">{{ this.file2_name }}</div>
               </div>
           </div>
           <div class="form-group" v-if="account_type==2">
               <label>انتخاب اسکن روزنامه رسمی</label>
               <input type="file" ref="file_input3" v-on:change="set_file(3)">
               <div class="select_file_div" v-on:click="$refs.file_input3.click()">
                   <div class="title">انتخاب فایل</div>
                   <div class="file_name">{{ this.file3_name }}</div>
               </div>
           </div>
           <div class="form-group btn_div" style="margin-top:20px">
               <button class="btn btn-success" v-on:click="send_data()">ارسال فایل</button>
           </div>

           <div class="alert alert-warning" id="spinner" v-if="send_form">
                <div class="spinner-border text-warning" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <span style="padding-right:10px;font-size:14px">در حال ارسال اطلاعات ...</span>
            </div>
     </div>
</template>

<script>
export default {
    name:"RegisterStep4",
    props:['account_type','mobile'],
    data(){
        return {
            file1_name:'',
            file2_name:'',
            file3_name:'',
            send_form:false,
            file1:null,
            file2:null,
            file3:null,
        }
    },
    methods:{
        set_file:function(n)
        {
            const name="file"+n;
            const file_input_name="file_input"+n;
            this[name]=this.$refs[file_input_name].files[0];
            this["file"+n+"_name"]=this[name].name;
        },
        send_data:function()
        {
            if(!this.send_form)
            {
                if(this.account_type==1)
                {
                    this.file3="true";
                }
                if(this.file1==null || this.file2==null || this.file3==null)
                {
                    this.$emit('setServerError','فایل های لازم را انتخاب نمایید');
                }
                else{
                    this.send_form=true;
                    this.$emit('setServerError',false);
                    const form_data=new FormData();
                    form_data.append('mobile',this.mobile);
                    form_data.append('account_type',this.account_type);
                    form_data.append('shenasname',this.file1);
                    form_data.append('cart',this.file2);
                    if(this.account_type==2)
                    {
                        form_data.append('rooznamepic',this.file3);
                    }
                    this.axios.post(this.$siteUrl+'/api/seller/upload_file',form_data,{
                        headers:{
                            'content-Type':'multipart/form-data'
                        }
                    }).then(response=>{
                        
                        if(response.data.status=="error_file_type")
                        {
                            this.send_form=false;
                            this.$emit('setServerError','فایل های انتخاب شده مجاز نیستند');
                        }
                        else if(response.data.status=='ok')
                        {
                            this.$emit('setServerError',false);
                            this.$emit('set_step',4);
                        }
                        else{
                            this.send_form=false;
                            this.$emit('setServerError','خطا در ارسال اطلاعات - مجددا تلاش نمایید');
                        }
                    }).catch(()=>{
                        this.send_form=false;
                        this.$emit('setServerError','خطا در ارسال اطلاعات - مجددا تلاش نمایید');
                    })
                }
            }
        }
    }
}
</script>

<style>

</style>
