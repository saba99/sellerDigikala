<template>
    <div>
        <b-modal id="product_list" hide-footer size="xl" hide-header>
            <div class="loading_box2" v-if="showLoading">
                <div class="spinner">
                    <div class="b1"></div>
                    <div class="b2"></div>
                    <div class="b3"></div>
                </div>
            </div>

            <div class="box_header">
                <div class="input_div">
                    <input type="text" class="form-control" v-model="search_text" placeholder="نام محصول .."><a class="btn btn-primary" v-on:click="getProduct(1)" style="color:white">جست و جو</a>
                </div>

                <button type="button" class="close" @click="$bvModal.hide('product_list')">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <table class="table table-bordered">
                <tbody>
                <tr v-for="(product,key) in ProductList.data" v-bind:key="key">
                    <td>
                        {{ getRow(key,5) }}
                    </td>
                    <td>
                        <img v-bind:src="$siteUrl+'/files/thumbnails/'+product.image_url" class="product_pic stockroom_product_pic">
                    </td>
                    <td>
                        <ul>
                            <li>
                                عنوان : {{ product.title }}
                            </li>
                            <li>
                                تعداد فروشنده : {{ getSellerCount(product) }}
                            </li>
                            <li>
                                تعداد تنوع قیمت :‌ {{ replaceNumber(product.get_warranty_count) }}
                            </li>
                        </ul>
                    </td>
                    <td>
                        <div v-if="product.get_warranty_count>0">
                            <span>کمترین قیمت  : </span>
                            <span>{{ replaceNumber(number_format((product.price-product.discount_price))) }} تومان</span>
                        </div>
                    </td>
                    <td style="width:160px">
                        <button class="btn btn-danger" v-on:click="add(product.id)">من هم میفروشم</button>
                    </td>
                </tr>
                </tbody>
            </table>
            <pagination :data="ProductList" @pagination-change-page="getProduct"></pagination>
        </b-modal>
    </div>
</template>

<script>
import myMixin from '../assets/myMixin';
export default {
    mixins:[myMixin],
    data(){
        return {
            ProductList:{data:[]},
            showLoading:false,
            search_text:'',
            page:1
        }
    },
    mounted(){
        this.getProduct();
    },
    methods:{
        getProduct:function(page=1){
            this.page=page;
            this.showLoading=true;
            const url=this.$siteUrl+'/api/seller/total_product?page='+page+'&search_text='+this.search_text;
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    this.ProductList=response.data;
                }
                
            }).catch((error)=>{
                this.setCatch(error);
            });
        },
        getSellerCount:function(product)
        {
            let n=parseInt(product.seller_list_count);
            if(product.digi_warranty!=null)
            {
                n++;
            }
            if(product.get_warranty_count==0)
            {
                n=0;
            }
            return this.replaceNumber(n);
        },
        add:function(product_id)
        {
            this.$router.push({name:'addProductWarranty',params:{id:product_id}});
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
        },
        show_server_error: function () {
            this.server_error = true;
            const app = this;
            setTimeout(function () {
                app.server_error = false
            }, 5000);
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