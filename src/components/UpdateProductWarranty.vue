<template>
    <div>
        <loading v-if="showLoading"></loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 

        <div class="panel">
            <div class="header">
                ویرایش تنوع قیمت -  {{ title }}
            </div>
            <div class="panel_content">
                <div v-if="account_status=='active'">

                   <div class="alert alert-warning" v-if="warning">
                       {{ warning }}
                   </div>
                    <div class="alert alert-warning">
                        در صورت نیاز به تغییر رنگ یا گارانتی تنوع قیمت لازم هست تنوع قیمت جدید ایجاد نمایید
                    </div>
                    <div class="form-group">
                       <label>انتخاب گارانتی : </label>
                       <select class="selectick auto_width" ref="warranty" v-model="warranty_id" data-live-search='true'>
                          <option v-for="(value,key) in warranty" :key="key" v-bind:value="key">{{ value }}</option>
                       </select>
                       <span class="has_error" v-if="warranty_id_error">{{ warranty_id_error }}</span>
                   </div>


                    <div class="form-group">
                        <div v-if="color_type==1">
                            <label>انتخاب رنگ : </label>
                            <select  class="selectick auto_width" ref="colors" v-model="color_id"  data-live-search='true'>
                               <option v-for="color in colors" :data-content="getColorOptionContent(color.code,color.name)" :value="'color_'+color.id" :key="color.id"></option>
                            </select>
                        </div>
                        <div v-else>
                            <label>انتخاب سایز : </label>
                            <select  class="selectick auto_width" ref="colors" v-model="color_id"  data-live-search='true'>
                               <option v-for="color in colors" :value="color.id" :key="color.id">{{ color.name }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>قیمت محصول : </label>
                        <input v-model="price1"  type="number" :options="options" class="form-control left price_input">
                        <span class="has_error" v-if="price1_error">{{ price1_error }}</span>
                    </div>

                    <div class="form-group">
                        <label>قیمت محصول برای فروش : </label>
                        <input v-model="price2" type="number" :options="options" class="form-control left price_input">
                        <span class="has_error" v-if="price2_error">{{ price2_error }}</span>
                    </div>

                    <div class="form-group">
                        <label>تعداد سفارش در سبد خرید : </label>
                        <input v-model="product_number_cart" type="number" :options="options" class="form-control left price_input">
                        <span class="has_error" v-if="product_number_cart_error">{{ product_number_cart_error }}</span>
                    </div>

                    <div class="form-group">
                        <label>تعداد موجودی محصول : </label>
                        <input v-model="product_number" type="number" :options="options" class="form-control left price_input">
                        <span class="has_error" v-if="product_number_error">{{ product_number_error }}</span>
                    </div>

                    <div class="form-group">
                        <label>زمان آماده سازی محصول : </label>
                        <input type="number" v-model="send_time" :options="options" class="form-control left price_input">
                        <span class="has_error" v-if="send_time_error">{{ send_time_error }}</span>
                    </div>
                    

                    <button class="btn btn-primary"  v-on:click="update()">ویرایش تنوع قیمت</button>
                </div>
                <div v-else>
                   <p style="padding-top:100px;text-align:center;font-size:50px">
                     <span class="fa fa-exclamation"></span>
                   </p>
                   <p style="text-align:center;padding-bottom:80px">شما دسترسی لازم برای عملیات جاری را ندارید</p>
               </div>
           </div>
        </div>

        <server-error-message v-if="server_error"></server-error-message> 
    </div>
</template>

<script>
// import Breadcrumb from './Breadcrumb';
import myMixin from '../assets/myMixin';
import AccountStatus from './AccountStatus';
import Loading from './Loading';
import ServerErrorMessage from './ServerErrorMessage';

// import Cleave from 'vue-cleave-component';
export default {
    mixins:[myMixin],
    components:{Loading,AccountStatus,ServerErrorMessage},
    data()
    {
        return {
            account_status:'active',
            showLoading:false,
            title:'',
            server_error:false,
            colors:[],
            warranty:[],
            warranty_id:'',
            color_id:0,
            BreadcrumbList:[
               { path:'/products/warranty/'+this.$route.params.id,title:'مدیریت تنوع های قیمت' },
               { path:'/products/warranty/'+this.$route.params.product_id+'/edit/'+this.$route.params.id,title:'ویرایش تنوع قیمت' },
            ],
            options: {
                delimiter: ',',
                numeral: true,
                numeralDecimalScale:3
            },
            price1:'',
            price1_error:false,
            price2:'',
            price2_error:false,
            product_number_cart:'',
            product_number_cart_error:false,
            send_time_error:false,
            send_time:'',
            product_number:'',
            product_number_error:false,
            warranty_id_error:false,
            send_form:true,
            warning:false,
            color_type:1
        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','products');
        this.getWarrantyData(this.$route.params.product_id,this.$route.params.id);
    },
    methods:{
        update:function()
        {
            const check_warranty=this.validate_field('گارانتی',this.warranty_id,'warranty_id_error');
            const check_price1=this.validate_field('قیمت محصول',this.price1,'price1_error');
            const check_price2=this.validate_field('قیمت محصول برای فروش',this.price2,'price2_error');
            const check_product_number=this.validate_field('تعداد موجودی محصول',this.product_number,'product_number_error');
            const check_product_number_cart=this.validate_field('تعداد سفارش در سبد خرید',this.product_number_cart,'product_number_cart_error');
            const check_send_time=this.validate_field('زمان آماده سازی محصول',this.send_time,'send_time_error');
            
            if(check_warranty && check_price1 && check_price2 && check_product_number && check_product_number_cart && check_send_time) 
            {
                if(this.send_form)
                {
                   this.send_form=false;
                   const formData=new FormData();
                   formData.append('product_id',this.$route.params.product_id);
                   formData.append('price1',this.price1);
                   formData.append('price2',this.price2);
                   formData.append('product_number',this.product_number);
                   formData.append('product_number_cart',this.product_number_cart);
                   formData.append('send_time',this.send_time);
                   formData.append('_method','PUT');
                   const url=this.$siteUrl+'/api/seller/ProductWarranty/'+this.$route.params.id;
                   this.axios.post(url,formData,this.setHeader()).then(response=>{
                       const result=this.setAccountStatus(response.data);
                       if(result)
                       {
                          if(response.data=='ok')
                          {
                                this.$router.push({name:'ProductWarranty',params:{success:'ok','id':this.$route.params.product_id,'message':'ویرایش تنوع قیمت با موفقیت انجام شد',}})
                          }
                          else if(response.data=='repetitive'){
                               this.send_form=true;
                               this.warning="تنوع قیمت با این گارانتی و رنگ قبلا توسط شما ثبت شد در صورت نیاز به تغییر هزینه میتواند از قسمت مدیریت گارانتی ها هزینه را ویرایش نمایید";
                          }
                          else{
                               this.send_form=true;
                               this.show_server_error();
                          }                          
                       }

                       
                   }).catch((error)=>{
                       this.send_form=true;
                       this.setCatch(error);
                   });
                }

            }
        },
        getWarrantyData: function (product_id, warranty_id) {
            this.showLoading = true;
            let url = this.$siteUrl + '/api/seller/ProductWarranty/' + product_id + '/create';
            if (warranty_id != undefined) {
                url = url + "?warranty_id=" + warranty_id;
            }
            this.axios.get(url, this.setHeader()).then(response => {
                this.showLoading = false;
                if (response.data == 'redirect') {
                    this.$router.push({ name: 'ProductList' })
                }
                else {
                    this.title = response.data.title;
                    this.colors = response.data.colors;
                    this.warranty = response.data.warranty;
                    if (response.data.product_warranty != undefined) {
                        this.price1 = response.data.product_warranty.price1;
                        this.price2 = response.data.product_warranty.price2;
                        this.product_number_cart = response.data.product_warranty.product_number_cart;
                        this.send_time = response.data.product_warranty.send_time;
                        this.color_id ='color_'+response.data.product_warranty.color_id;
                        this.warranty_id = response.data.product_warranty.warranty_id;
                        this.product_number = response.data.product_warranty.product_number;
                        if (this.colors.length > 0) {
                            if(this.colors[0].code==null){
                                this.color_type=2;
                                this.color_id=response.data.product_warranty.color_id;
                            }
                        }
                    }
                    else {
                        if (this.colors.length > 0) {
                            this.color_id = this.colors[0].id;
                            this.color_type=this.colors[0].color_type;
                        }
                    }

                    // this.$nextTick(function () {
                    //     $(this.$refs.colors).selectpicker('refresh');
                    //     $(this.$refs.warranty).selectpicker('refresh');
                    // });
                }
            }).catch((error) => {
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
        },validate_field: function (label, field_name, field_error, field_length) {
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
        },
    }
}
</script>

<style>

</style>