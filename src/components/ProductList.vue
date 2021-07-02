<template>
    <div>
        <loading v-if="showLoading"></loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 


        <div class="panel">
            
            <div class="header">
               مدیریت محصولات


                <b-dropdown id="dropdown-1" text="گزینه ها" variant="btn">
                    <b-dd-item to='/products/add'>
                        <span class="fa fa-pencil"></span>
                        <span>افزودن محصول جدید</span>
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
                        <input type="text" class="form-control" v-model="search_title" placeholder="عنوان محصول">
                        <a class="btn btn-primary" v-on:click="getProduct(1)" style="color:white">جست و جو</a>
                    </form>
                    <a class="btn btn-danger show_product_list_link" v-on:click="product_list()"  style="color:white;margin-bottom:10px;">جست و جوی بین محصولات فروشگاه</a>
                </div>
            

                <table class="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>ردیف</th>
                        <th>تصویر محصول</th>
                        <th>عنوان</th>
                        <th>وضعیت محصول</th>
                        <th>عمیات</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(product,key) in productList.data" :key="product.id">
                            <td>{{ getRow(key) }}</td>
                            <td><img :src="$siteUrl+'/files/thumbnails/'+product.image_url" class="product_pic"></td>
                            <td style="width:60%">
                                {{ product.title }}
                            </td>
                            <td >
                                <span :class="productStatusClass[(product.status+3)]" style="font-size:14px;padding:5px 7px">
                                    {{ productStatus[(product.status+3)] }}
                                </span>
                            </td>
                            <td style="width:130px">
                                <span v-b-tooltip.hover title="ویرایش محصول" v-if="product.seller_id==seller_id" class="fa fa-edit" v-on:click="$router.push({name:'UpdateProduct',params:{id:product.id}})"></span>
                                <span v-b-tooltip.hover title="گالری تصاویر"  v-if="product.seller_id==seller_id" class="fa fa-image" v-on:click="$router.push({name:'Gallery',params:{id:product.id}})"></span>
                                <span v-b-tooltip.hover title="مشخصات فنی"  v-if="product.seller_id==seller_id" class="fa fa-list-alt" v-on:click="$router.push({name:'Items',params:{id:product.id}})"></span>
                                <span v-b-tooltip.hover title="تنوع های قیمت"  class="fa fa-line-chart" v-on:click="$router.push({name:'ProductWarranty',params:{id:product.id}})"></span>
                                <span v-b-tooltip.hover title="حذف محصول"  class="fa fa-trash-o" v-if="product.status==-2 || product.status==-3" v-on:click="remove_produt(product.id)"></span>
                            </td>
                        </tr>
                        <tr v-if="productList.data.length==0">
                            <td colspan="5">رکوردی یافت نشد</td>
                        </tr>
                    </tbody>
                </table>

                <pagination :data="productList" @pagination-change-page="getProduct"></pagination>

            </div>
        </div>


        <div class="message_div" v-if="showMessageDialog">
            <div class="message_box">
                <p id="msg">آیا از حذف این محصول مطمئن هستین ؟</p>
                <a class="alert alert-success" v-on:click="remove_product_of_list">بله</a>
                <a class="alert alert-danger" v-on:click="showMessageDialog=!showMessageDialog">خیر</a>
             </div>
        </div>
        <server-error-message v-if="server_error"></server-error-message>

        <total-product-list></total-product-list>

    </div>
</template>

<script>
import myMixin from '../assets/myMixin';
import AccountStatus from './AccountStatus';
import TotalProductList from './TotalProductList.vue';
export default {
    mixins:[myMixin],
    components:{TotalProductList,AccountStatus},
    data()
    {
        return {
            show_product_list:false,
            server_error:false,
            showLoading:true,
            productList:{data:[]},
            BreadcrumbList:[
                { path:'/products',title:'مدیریت محصولات' },
            ],
            page:1,
            productStatus:[
                'رد شده',
                'در انتظار تایید',
                'توقف تولید',
                'نا موجود',
                'منتشر شده'
            ],
            productStatusClass:[
                'alert alert-danger',
                'alert alert-warning',
                'alert alert-secondary',
                'alert alert-primary',
                'alert alert-success',
            ],
            account_status:'active',
            seller_id:-1,
            showMessageDialog:false,
            delete_product_id:0,
            show_alert_message:false,
            alert_message:'',
            search_title:''
        }
    },
    mounted(){
        this.seller_id=localStorage.getItem('seller_id');
        if(this.$route.params.success=='ok')
        {

            this.show_alert_message=true;
            if(this.$route.params.message!=undefined)
            {
                this.alert_message=this.$route.params.message;
            }
            else{
                this.alert_message='ثبت محصول با موفقیت انجام شد و بعد از تایید به فروشگاه اضافه خواهد  شد';
            }
        }
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','products');
        this.getProduct();
    },
    methods:{
        getProduct:function(page=1)
        {
            this.showLoading=true;
            this.page=page;
            const url=this.$siteUrl+'/api/seller/product/list?page='+page+'&search_text='+this.search_title;
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    this.productList=response.data;
                }
                
            }).catch((error)=>{
                this.setCatch(error);
            });
        },
        remove_produt:function(id)
        {
            this.showMessageDialog=true;
            this.delete_product_id=id;
        },
        remove_product_of_list:function()
        {
            this.showLoading=true;
            this.showMessageDialog=false;
            const url=this.$siteUrl+'/api/seller/product/'+this.delete_product_id;
            this.axios.delete(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result && response.data!='error')
                {
                    this.productList=response.data;
                    this.show_alert_message=true;
                    this.alert_message='حذف محصول با موفقیت انجام شد';
                }
                else{
                    this.show_server_error();
                }
            }).catch((error)=>{
                this.showLoading=false;
                if(error.response){
                    if(error.response.status==401)
                    {         
                       this.logout();
                    }
                    else{
                       this.show_server_error();
                    }
                }
                else{
                    this.show_server_error();
                }
            });
        },
        product_list:function()
        {
            this.$bvModal.show('product_list');
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
    }
}
</script>

<style>

</style>