<template>
    <div>
        <loading v-if="showLoading"></loading>
          <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 

         <div class="panel">

             <div class="header">افزودن محصول جدید</div>

             <div class="panel_content">

                 <div v-if="account_status=='active'">

                    <div v-if="errors.length>0" class="alert alert-warning">
                        <ul class="errors_ul">
                            <li :key="key" v-for="(error,key) in errors">{{ error }}</li>
                        </ul>
                    </div>
                    <div class="form-group">

                        <label>عنوان محصول : </label>
                        <input type="text" class="form-control total_width_input" v-model="title">

                    </div>
                    <div class="form-group">
                        <vue-editor v-model="content"></vue-editor>
                    </div>

                    <div class="row">
                       <div class="col-md-6">
                           <div class="form-group">
                                <label>نام لاتین محصول : </label>
                                <input type="text" class="form-control left" v-model="ename">
                                <span class="has_error"></span>
                            </div>
                            <div class="form-group">
                                <label>انتخاب دسته محصول : </label>
                                <select v-model="catId" ref="cat"   class="select" data-live-search="true">
                                     <option v-bind:value="key" :key="key" v-for="(cat,key) in catList">{{ cat }}</option>
                                </select> 
                            </div>

                             <div class="form-group">
                                <label>انتخاب برند : </label>
                                <select v-model="brandId" ref="brand"   class="select" data-live-search="true">
                                     <option v-bind:value="key" :key="key" v-for="(brand,key) in brandList">{{ brand }}</option>
                                </select> 
                            </div>
                             <div class="form-group">
                                <label>انتخاب رنگ های محصول : </label>
                                <select v-model="colorId" multiple="multiple" ref="color"   class="select" data-live-search="true">
                                     <option v-bind:value="color.id" :key="key" v-for="(color,key) in colorList">{{ color.name }}</option>
                                </select> 
                            </div>


                            <div class="form-group">
                                <button class="btn btn-success" style="margin-top:20px" v-on:click="addProduct()">افزودن محصول</button>
                            </div>
                       </div>
                       <div class="col-md-6">
                           <div class="choice_pic_box" v-on:click="$refs.fileInput.click()">
                                <span class="title">انتخاب تصویر محصول</span>
                                <input type="file" ref="fileInput"  name="pic" id="pic" style="display:none" v-on:change="showImage">
                                <img v-bind:src="image_src"  id="output" class="slider_pic">
                            </div>
                       </div>
                    </div>
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
import { VueEditor } from "vue2-editor";

import ServerErrorMessage from './ServerErrorMessage'
export default {
    components:{VueEditor,Loading,AccountStatus,ServerErrorMessage},
    mixins:[myMixin],
    data(){
        return{
            server_error:false,
            BreadcrumbList:[
                { path:'/products',title:'مدیریت محصولات' },
                 {path:'/products/add',title:'افزودن محصول جدید'}
            ],
            catList:[],
            brandList:[],
            colorList:[],
            account_status:'active',
            showLoading:true,
            title:'',
            image_src:'',
            content:'',
            ename:'',
            catId:0,
            brandId:0,
            colorId:[],
            image:'',
            errors:[],
            send_form:true
        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','products');
        this.getCatList();
        this.getBrand();
        this.getColor();
    },
    methods:{
        showImage:function()
        {
            this.image=this.$refs.fileInput.files[0];
            this.image_src=URL.createObjectURL(this.image);
        },
        addProduct:function(){
            if(this.send_form)
            {
                this.errors=[];
               const validateTitle=this.validateTitle() ;
                const validateContent=this.validateContent();
                const validateCatId=this.validateCatId();
                const validateBrandId=this.validateBrandId();
                const validateImage=this.validateImage();
                if(validateTitle && validateContent && validateCatId && validateBrandId && validateImage)
                { 
                    this.showLoading=true;
                    this.send_form=false;
                    const url=this.$siteUrl+'/api/seller/product/create';
                    const formData=new FormData();
                    formData.append('title',this.title);
                    formData.append('tozihat',this.content);
                    formData.append('cat_id',this.catId);
                    formData.append('brand_id',this.brandId);
                    //formData.append('product_color',this.colorId);
                    formData.append('ename',this.ename);
                    formData.append('pic',this.image);

                    this.axios.post(url,formData,this.setHeader(true)).then(response=>{
                        const result=this.setAccountStatus(response.data);
                        if(result)
                        {
                            if(response.data=="ok")
                            {
                                this.$router.push({name:'ProductList',params:{success:'ok'}})
                            }
                            else if(response.data.errors!=undefined)
                            {
                                this.errors=response.data.errors;
                            }
                        }
                        this.showLoading=false;
                    }).catch((error)=>{
                        if(error.response.status==401)
                        {
                            this.logout();
                        }
                        else
                        {
                            this.send_form=true;
                            this.showLoading=false;
                            this.show_server_error();
                        }
                    });
                }
            }
        },
        getCatList: function () {
        const url = this.$siteUrl + '/api/seller/category';
        this.axios.get(url, this.setHeader()).then(response => {
            this.showLoading = false;
            
            const result = this.setAccountStatus(response.data);
            if (result) {
                // /*global $ */
                this.catList = response.data;
                this.account_status = 'active';
                // this.$nextTick(function () {
                //     $(this.$refs.cat).selectpicker('refresh');
                // });
            }
        }).catch((error) => {
            this.showLoading = false;
            if (error.response.status == 401) {
                this.logout();
            }
            else {
                this.show_server_error();
            }
        });
    } ,setAccountStatus: function (data) {
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
        },getBrand: function () {
            const url = this.$siteUrl + '/api/seller/brand';
            this.axios.get(url, this.setHeader()).then(response => {
                const result = this.setAccountStatus(response.data);
                if (result) {
                    this.brandList = response.data;
                    // this.$nextTick(function () {
                    //     $(this.$refs.brand).selectpicker('refresh');
                    // });
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.logout();
                }
                else {
                    this.show_server_error();
                }
            });
        },
        getColor: function () {
            const url = this.$siteUrl + '/api/seller/color';
            this.axios.get(url, this.setHeader()).then(response => {
                const result = this.setAccountStatus(response.data);
                if (result) {
                    this.colorList = response.data;
                    // this.$nextTick(function () {
                    //     $(this.$refs.color).selectpicker('refresh');
                    // });
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    this.logout();
                }
                else {
                    this.show_server_error();
                }
            });
        },
       validateTitle: function () {
            if (this.title.trim() == "") {
                this.errors.push('عنوان محصول نمی تواند خالی باشد');
                return false;
            }
            else if (this.title.trim().length < 10) {
                this.errors.push('عنوان هر محصول حداقل باید شامل ۱۰ کاراکتر باشد');
                return false;
            }
            else {
                return true;
            }
        },validateContent: function () {
            if (this.content.trim() == "") {
                this.errors.push('توضیحات محصول نمی تواند خالی باشد');
                return false;
            }
            else if (this.content.trim().length < 40) {
                this.errors.push('توضیحات هر محصول حداقل باید شامل ۴۰ کاراکتر باشد');
                return false;
            }
            else {
                return true;
            }
        },
        validateCatId: function () {
            if (this.catId == 0) {
                this.errors.push('دسته محصول را انتخاب نمایید');
                return false;
            }
            else {
                return true;
            }
        },
        validateBrandId: function () {
            if (this.brandId == 0) {
                this.errors.push('برند محصول را انتخاب نمایید');
                return false;
            }
            else {
                return true;
            }
        },
        validateImage: function () {
            if (this.image == '' && this.image_src == '') {
                this.errors.push('تصویر محصول را انتخاب نمایید');
                return false;
            }
            else if (this.image.size > 1024 * 1024) {
                this.errors.push('حجم تصویر باید حداکثر 1M باشد');
                return false;
            }
            else {
                return true;
            }
        },
    }
}
</script>

<style>

</style>