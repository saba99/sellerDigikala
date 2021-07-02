<template>
    <div>
        <loading v-if="showLoading"></Loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 
       <div class="panel">
            <div class="header">
                مدیریت تنوع های قیمت - {{ title }}

                <b-dropdown id="dropdown-1" text="گزینه ها" variant="btn">
                    <b-dd-item :to="'/products/warranty/add/'+product_id">
                        <span class="fa fa-pencil"></span>
                        <span>افزودن تنوع قیمت جدید</span>
                    </b-dd-item>
                    <b-dd-item :to="'/products/warranty/'+product_id+'?trashed=true'">
                        <span class="fa fa-trash"></span>
                        <span>
                            سطل زباله ({{ replaceNumber(trash_product_warranties_count) }})
                        </span>
                    </b-dd-item>
                </b-dropdown>
            </div>
            <div class="panel_content">
                <div v-if="account_status=='active'">
                <div v-if="show_alert_message" style="margin-bottom:10px" class="alert alert-success alert-dismissible fade show" role="alert">
                   <span>{{ alert_message }}</span>
                   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                   </button>
                </div>
            

                <table class="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>ردیف</th>
                        <th>نام گارانتی</th>
                        <th>قیمت محصول</th>
                        <th>قیمت محصول برای فروش</th>
                        <td>تعداد موجودی محصول</td>
                        <td>رنگ(یا سایز)</td>
                        <th>عمیات</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(warranty,key) in product_warranties.data" :key="warranty.id">
                            <td>{{ getRow(key) }}</td>
                            <td>{{ warranty.get_warranty.name }} </td>
                            <td style="min-width:160px">
                                <div class="alert alert-success">
                                     {{ replaceNumber(number_format(warranty.price1)) }} تومان
                                </div>
                            </td>
                            <td style="min-width:160px">
                                <div class="alert alert-warning">
                                     {{ replaceNumber(number_format(warranty.price2)) }} تومان
                                </div>
                            </td>
                            <td>{{ replaceNumber(number_format(warranty.product_number)) }} </td>
                            <td style="width:140px">
                                <span :style="{background:'#'+warranty.get_color.code}" v-if="warranty.get_color!=null" class="color_td">
                                    <span  >{{ warranty.get_color.name }}</span>
                                </span>
                            </td>
                            <td>
                                <router-link  v-if="warranty.deleted_at==null" :to="'/products/warranty/'+product_id+'/edit/'+warranty.id">
                                    <span class="fa fa-edit"></span>
                                </router-link>
                                <span v-if="warranty.deleted_at==null" class="fa fa-trash-o"  v-on:click="remove_warranty(warranty.id)"></span>
                                <span v-if="warranty.deleted_at!=null" class="fa fa-refresh"  v-on:click="restore_warranty(warranty.id)"></span>
                            </td>
                        </tr>
                        <tr v-if="product_warranties.data.length==0">
                            <td colspan="7">رکوردی یافت نشد</td>
                        </tr>
                    </tbody>
                </table>

                <pagination :data="product_warranties" @pagination-change-page="getData"></pagination>

                </div>
                <div v-else>
                   <p style="padding-top:100px;text-align:center;font-size:50px">
                     <span class="fa fa-exclamation"></span>
                   </p>
                   <p style="text-align:center;padding-bottom:80px">شما دسترسی لازم برای عملیات جاری را ندارید</p>
               </div>
           </div>
        </div>

        <div class="message_div" v-if="showMessageDialog">
            <div class="message_box">
                <p id="msg">{{ msg }}</p>
                <a class="alert alert-success" v-on:click="remove_warrany_of_list">بله</a>
                <a class="alert alert-danger" v-on:click="showMessageDialog=!showMessageDialog">خیر</a>
             </div>
        </div> 
        <server-error-message v-if="server_error"></server-error-message> 
    </div>
</template>

<script>
import myMixin from '../assets/myMixin';
import AccountStatus from './AccountStatus';
import ServerErrorMessage from './ServerErrorMessage';
export default {
    name:"ProductWarranty",
    components:{AccountStatus,ServerErrorMessage},
    mixins:[myMixin],
    data(){
        return{
            account_status:'active',
            showLoading:true,
            server_error:false,
            BreadcrumbList:[
                { path:'/products',title:'مدیریت محصولات' },
                { path:'/products/warranty/'+this.$route.params.id,title:'مدیریت تنوع های قیمت' },
            ],
            product_id:0,
            page:1,
            title:'',
            product_warranties:{data:[]},
            trash_product_warranties_count:0,
            showMessageDialog:false,
            msg:"آیا از حذف این تنوع قیمت مطمئن هستین ؟",
            warranty_id:0,
            show_alert_message:false,
            trashed:false
        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','products');
        this.product_id=this.$route.params.id;
        let params=new window.URLSearchParams(window.location.search);
        if(params.get('trashed')=='true')
        {
            this.trashed=true;
            this.BreadcrumbList.push({title:'سطل زباله','path':''});
        }
        if(this.$route.params.success=='ok')
        {

            this.show_alert_message=true;
            if(this.$route.params.message!=undefined)
            {
                this.alert_message=this.$route.params.message;
            }
            else{
                this.alert_message='ثبت تنوع قیمت با موفقیت انجام شذ ';
            }
        }
        this.getData();

    },
    methods:{
        getData:function(page=1)
        {
            this.page=page;
            const url=this.$siteUrl+'/api/seller/ProductWarranty/'+this.product_id+'?page='+page+'&trashed='+this.trashed;
            this.showLoading=true;
            this.axios.get(url,this.setHeader()).then(response=>{
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    this.showLoading=false;
                    if(response.data.title!=undefined)
                    {
                        this.title=response.data.title;
                        this.product_warranties=response.data.product_warranties;
                        this.trash_product_warranties_count=response.data.trash_product_warranties_count;
                    }
                }
            }).catch((error)=>{
                this.showLoading=false;
                this.setCatch(error);
            });
        },
        remove_warranty:function(id)
        {
            this.showMessageDialog=true
            this.warranty_id=id;
        },
        remove_warrany_of_list:function(){
            this.showMessageDialog=false;
            const url=this.$siteUrl+'/api/seller/ProductWarranty/'+this.warranty_id;
            this.showLoading=true;
            this.axios.delete(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                if(response.data.product_warranties!=undefined)
                {
                    this.show_alert_message=true;
                    if(this.trashed)
                    {
                        this.alert_message='بازبای تنوع قیمت با موفقیت انجام شد';
                    }
                    else{
                        this.alert_message='حذف تنوع قیمت با موفقیت انجام شد';
                    }
                    this.product_warranties=response.data.product_warranties;
                    this.trash_product_warranties_count=response.data.trash_product_warranties_count;
                }
                else{
                    this.show_server_error();
                }
            }).catch(error=>{
                this.setCatch(error);
            })
        },
        restore_warranty:function(id){
            this.showMessageDialog=true
            this.warranty_id=id;
            this.msg='آیا از بازیابی این تنوع قیمت مطمئن هستین ؟';
        }, 
       
        setHeader: function (image) {
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
        getRow: function (n, count) {
            count = count == undefined ? 10 : count;
            var row = n + 1;
            row = row + (this.page - 1) * count;
            return this.replaceNumber(row);
        },
    },
    watch:{
        '$route.query.trashed'(){
           this.trashed=!this.trashed;
           if(this.trashed){
               this.BreadcrumbList.push({title:'سطل زباله','path':''});
           }
           else{
               this.$delete(this.BreadcrumbList,2);
           }
           this.getData();
        }
    }
}
</script>

<style>

</style>