<template>
  <div>
       <loading v-if="showLoading"></loading>
       <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
       <account-status :account_status="account_status"></account-status> 
         <div class="panel">
            <div class="header">
              موجودی های انبار
            </div>
            <div class="panel_content">
                <div v-if="account_status=='active'">

                <div class="search_form order_search">
                    <input type="text" v-model="title" placeholder="عنوان محصول" class="form-control" style="margin-left:10px">
                     <select id="stockroom" v-model="stockroom_id" ref="stockroomList" class="selectick auto_width">
                        <option value="all">انتخاب انبار</option>
                        <option v-for="row in stockroom" v-bind:key="row.id"  v-bind:value="row.id">{{ row.name }}</option>
                    </select>
                    <button class="btn btn-primary" v-on:click="getList(1)" style="margin-right:10px">جست و جو</button>
                </div>
                
                <table class="table table-bordered">
                  <thead>
                    <tr>
                       <th>ردیف</th>
                       <th>تصویر محصول</th>
                       <th>عنوان محصول</th>
                       <th>گارانتی</th>
                       <th>رنگ</th>
                       <th>انبار</th>
                       <th>تعداد</th>
                    </tr>
                  </thead>
                <tbody>
                    <tr v-for="(row,key) in list.data" :key="key">
                        <td>
                           {{ getRow(key) }}
                        </td>
                        <td>
                             <img v-bind:src="$siteUrl+'/files/thumbnails/'+row.get_product_warranty.get_product.image_url" class="product_pic stockroom_product">
                        </td>
                        <td>
                             <span>{{ row.get_product_warranty.get_product.title }}</span>
                        </td>
                        <td>
                            {{ row.get_product_warranty.get_warranty.name }}
                        </td>
                         <td style="width:150px">
                            <span v-if="row.get_product_warranty.get_color.id>0" :style="[{ background:'#'+row.get_product_warranty.get_color.code }]" class="color_td">
                                 <span style="color:white">{{ row.get_product_warranty.get_color.name}}</span>
                            </span>
                        </td>
                        <td>
                            <span v-if="row.get_stockroom">
                                {{ row.get_stockroom.name }}
                            </span>
                        </td>
                        <td>{{ replaceNumber(row.product_count) }}</td>
                    </tr>
                    <tr v-if="list.data.length==0">
                        <td colspan="6">رکوردی یافت نشد</td>
                    </tr>
                </tbody>
                </table>

                <pagination :data="list" @pagination-change-page="getList"></pagination>

                
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
import myMinix from '../assets/myMixin';
export default {
    mixins:[myMinix],
    data(){
        return {
            showLoading:false,
            server_error:false,
            account_status:'active',
            BreadcrumbList:[
                { path:'/inventory',title:'موجودی های انبار' },
            ],
            title:'',
            list:{data:[]},
            page:1,
            stockroom:[],
            stockroom_id:"all",
        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','package');
        this.getStockroomList();
        this.getList();

    },
    methods:{
        getList:function(page=1){
            this.page=page;
            this.showLoading=true;
            const url=this.$siteUrl+'/api/seller/getStockroomProductList?page='+page+'&search_text='+this.title+'&stockroom_id='+this.stockroom_id;
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    this.list=response.data;
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
        getStockroomList: function () {
            const url = this.$siteUrl + '/api/seller/stockroomList';
            this.axios.get(url, this.setHeader()).then(response => {
                const result = this.setAccountStatus(response.data);
                if (result) {
                    this.stockroom = response.data;
                    
                }
            }).catch((error) => {
                this.setCatch(error);
            });
        },
    }
}
</script>

<style>

</style>