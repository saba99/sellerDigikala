<template>
  <div>
       <loading v-if="showLoading"></loading>
       <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
       <account-status :account_status="account_status"></account-status> 

          <div class="panel">
            <div class="header">افزودن محموله جدید</div>
            <div class="panel_content">
                <div v-if="account_status=='active'">

                             <div class="alert alert-warning" v-if="errors.length>0">
             <ul class="error_ul">
                 <li v-for="(msg,key) in errors" v-bind:key="key">
                     {{ msg }}
                 </li>
             </ul>
         </div>
         <div style="padding-bottom:20px">
             <div class="form-group">
                 <label for="stockroom">انتخاب انبار</label>
                 <select id="stockroom" v-model="stockroom_id" ref="stockroomList" class="selectick auto_width">
                     <option value="0">انتخاب انبار</option>
                     <option v-for="row in stockroom" v-bind:key="row.id" v-bind:value="row.id">{{ row.name }}</option>
                 </select>
             </div>

             <div class="form-group">
                <label>تاریخ ارسال محوله</label>
                <!-- <pdatepicker v-model="date" 
                       placeholder="" 
                       input-class="form-control" 
                       hover-day-back-color="#00bfd6"
                       header-background-color="#00bfd6"
                       chosen-day-back-color="#00bfd6">
                </pdatepicker> -->
                <input type="date" class="form-control" v-model="date"  name="date">
             </div>
             <div class="form-group">
                 <textarea v-model="tozihat" placeholder="توضیحات" style="width:100%;height:170px" class="form-control"></textarea>
             </div>
             <b-button data-toggle="modal"  ref="modal" data-target=".product_list" class="alert alert-success select_product_btn"  @click="modalShow = !modalShow"> افزودن محصول</b-button>
             
         </div>

         <p style="margin-top:30px;margin-bottom:20px">محصولات انتخاب شده</p> 
         <table class="table table-bordered">
             <thead>
                 <tr>
                     <th>ردیف</th>
                     <th>تصویر محصول</th>
                     <th>عنوان محصول</th>
                     <th>گارانتی</th>
                     <th>رنگ</th>
                     <th>تعداد</th>
                     <th>عملیات</th> 
                 </tr>
             </thead>
             <tbody>
                 <tr v-for="(item,key) in selected_product" v-bind:key="key">
                      <td>
                         {{ getRow(key) }}
                      </td>
                      <td>
                           <img v-bind:src="$siteUrl+'/files/thumbnails/'+item.get_product.image_url" class="product_pic stockroom_product">
                      </td>
                      <td>
                           <span>{{ item.get_product.title }}</span>
                      </td>
                      <td style="font-size:14px">
                            <span>{{ item.get_warranty.name }}</span>
                      </td>
                      <td style="width:150px">
                            <span v-if="item.get_color.id>0" :style="[{ background:'#'+item.get_color.code }]" class="color_td">
                                 <span style="color:white">{{ item.get_color.name}}</span>
                            </span>
                      </td>
                      <td style="width:70px">
                            <input type="text" v-model="selected_product[key].product_number" placeholder="تعداد"  class="form-control" style="width:70px;text-align:center">
                       </td>
                       <td style="width:100px">
                            <span class="remove_item" v-on:click="removeOfList(key)">حذف</span>
                       </td>
                  </tr>
                  <tr v-if="selected_product.length==0">
                      <td colspan="8">هیچ محصولی انتخاب نشده</td>
                  </tr>
             
             </tbody>
         </table> 

         <button class="btn btn-success" style="border-radius:0px" v-on:click="send_data()">
             ثبت نهایی
         </button>
       
    <b-modal v-model="modalShow">
         <!-- <div class="modal fade product_list" role="modal" ref="modal">
             <div class="modal-dialog modal-lg">
                 <div class="modal-content"> -->
                      <div class="loading_box2" v-if="get_data">
                         <div class="spinner">
                           <div class="b1"></div>
                           <div class="b2"></div>
                           <div class="b3"></div>
                         </div>
                      </div>

                     <div class="box_header">
                         <div class="input_div">
                             <input type="text" class="form-control" v-model="search_text" placeholder="نام محصول .."><a class="btn btn-primary" v-on:click="getProductWarrnty(1)" style="color:white">جست و جو</a>
                         </div>

                         <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                           <span aria-hidden="true">&times;</span>
                        </button>
                     </div> 
                     <table class="table table-bordered">
                         <tbody>
                             <tr v-for="(item,key) in ProductList.data" v-bind:key="key">
                                 <td>
                                     {{ getRow(key) }}
                                 </td>
                                 <td>
                                     <img v-bind:src="$siteUrl+'/files/thumbnails/'+item.get_product.image_url" class="product_pic stockroom_product_pic">
                                 </td>
                                 <td>
                                     <span>{{ item.get_product.title }}</span>
                                 </td>
                                 <td style="font-size:14px">
                                     <span>{{ item.get_warranty.name }}</span>
                                 </td>
                                 <td style="width:150px">
                                     <span v-if="item.get_color.id>0 && item.get_color.type==1" :style="[{ background:'#'+item.get_color.code }]" class="color_td">
                                         <span style="color:white">{{ item.get_color.name}}</span>
                                     </span>
                                     <span v-if="item.get_color.id>0 && item.get_color.type==2">
                                        سایز : {{ item.get_color.name}}
                                     </span>
                                 </td>
                                 <td style="width:70px">
                                     <input type="text" v-model="product_count[key]" placeholder="تعداد"  class="form-control" style="width:70px;text-align:center">
                                 </td>
                                 <td style="width:130px">
                                     <span v-if="checkInList(item.id)" style="color:#ef5661">اضافه شد</span>
                                     <span v-else class="select_item" v-on:click="add_product(item.id,key)">افزودن به لیست</span>
                                 </td>
                             </tr>
                         </tbody>
                     </table>
                     <pagination :data="ProductList" @pagination-change-page="getProductWarrnty"></pagination>

                 <!-- </div>
             </div>
         </div> -->


         <div class="message_div" v-if="show_messag_box" style="display:block">
           <div class="message_box">
            <p id="msg">{{msg }}</p>
            <a class="alert alert-success" v-on:click="add_product_to_stockroom()">بله</a>
            <a class="alert alert-danger" v-on:click="show_messag_box=false">خیر</a>
          </div>
        </div>

         </b-modal>   
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
            account_status:'active',
            server_error:false,
            BreadcrumbList:[
                { path:'/package',title:'مدیریت محموله ها' },
                { path:'/package/add',title:'افزودن محموله جدید' },
            ], 
            modalShow: false,
            stockroom:[],
            stockroom_id:0,
            product_count:[],
            selected_product:[],
            ProductList:{data:[]},
            errors:[],
            tozihat:'',
            get_data:false,
            page:1,
            search_text:'',
            show_messag_box:false,
            date:'',
            send:false,
            msg:'ایا از افزودن این محصول به انبار مطمئن هستین؟',
        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','package');
        this.getStockroomList();
     ( this.getProductWarrnty());
    },
    methods:{
        getProductWarrnty:function(page=1)
        {
            this.page=page;
            this.get_data=true;
            this.showLoading=true;
            const url=this.$siteUrl+"/api/seller/stockroom/getProductWarrnty?page="+page+'&search_text='+this.search_text;
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result){
                    for(let i=0;i<response.data.data.length;i++)
                    {
                       this.product_count[i]=response.data.data[i].product_number;
                    }
                    this.ProductList=response.data;
                }
                this.get_data=false;
            }).catch(error=>{
                this.get_data=false;
                this.setCatch(error);
            })
        },
                checkInList:function(id)
        {
            let result=false;
            this.selected_product.forEach(function(row){
                if(row.id==id)
                {
                    result=true;
                }
            });
            return result;
        },
        add_product:function(id,key)
{ 
            this.show_messag_box=true;
            this.select_id=id;
            this.select_key=key;
        },
        add_product_to_stockroom:function(){
             this.show_messag_box=false;
             const n=this.product_count[this.select_key];
             if(parseInt(n)>0)
             {
                 let item=this.ProductList.data[this.select_key];
                 item.product_number=n;
                 this.selected_product.push(item);
             }
        },
        removeOfList:function(key){
            this.$delete(this.selected_product,key);
        },
        send_data:function(){
            this.errors=[];
            let send=true;
            if(this.stockroom_id==0)
            {
                send=false;
                this.errors.push('لطفا انبار ارسال کالا را انتخاب نمایید');
            }
            if(this.selected_product.length==0)
            {
                send=false;
                this.errors.push('لطفا کالا هایی که میخواهید به انبار اضافه شود را انتخاب نمایید');
            }
            if(this.date.trim()=='')
            {
                send=false;
                this.errors.push('لطفا زمان ارسال محموله به انبار را انتخاب نمایید');
            }
            if(send)
            {
                let string='';
                this.showLoading=true;
                this.selected_product.forEach(function(row){
                    string=string+"@"+row.id+"_"+row.product_number;
                });
                const url=this.$siteUrl+"/api/stockroom/seller/add_product";
                const formData=new FormData();
                formData.append('list',string);
                formData.append('stockroom_id',this.stockroom_id);
                formData.append('tozihat',this.tozihat);
                formData.append('date',this.date);
                this.axios.post(url,formData,this.setHeader()).then(response=>{
                    this.show_loading=false;
                    const result=this.setAccountStatus(response.data);
                    if(result)
                    {  
                       if(response.data=='ok')
                       {
                           this.$router.push({name:"Package"})
                       }
                       else{
                           this.show_server_error();
                       }
                    }
                }).catch(error=>{
                    this.setCatch(error);
                });
            }
        },
    getStockroomList: function () {
        const url = this.$siteUrl + '/api/seller/stockroomList';
        this.axios.get(url, this.setHeader()).then(response => {
            const result = this.setAccountStatus(response.data);
            if (result) {
                this.stockroom = response.data;
                // this.$nextTick(function () {

                //     $(this.$refs.stockroomList).selectpicker('refresh');
                // })
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
        }, show_server_error: function () {
        this.server_error = true;
        const app = this;
        setTimeout(function () {
            app.server_error = false
        }, 5000);
    },getRow: function (n, count) {
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