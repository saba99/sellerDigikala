<template>
     <div>
        <loading v-if="showLoading"></loading>
        <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
        <account-status :account_status="account_status"></account-status> 
          <div class="panel">

             <div class="header">
                  ثبت مشخصات فنی برای {{ title }}
             </div>

             <div class="panel_content">

                 <div v-if="account_status=='active'">

                <div v-if="show_alert_message" style="margin-bottom:10px" class="alert alert-success alert-dismissible fade show" role="alert">
                   <span>{{ alert_message }}</span>
                   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                   </button>
                </div>

                   <form id="product_items_form">
                        <div v-for="item in product_items" :key="item.id" class="item_groups" style="margin-bottom:20px">
                        <p class="title">{{ item.title }}</p>

                        <div class="form-group" v-for="childItem in item.get_child" :key="childItem.id">
                            <label>{{ childItem.title }}</label>
                            <input v-if="childItem.get_value.length>0" type="text" :ref="'item_value_'+childItem.id" class="form-control item_value" :value="childItem.get_value[0].item_value" :name="get_child_input_name(childItem.id)">
                            <input v-else type="text" class="form-control item_value" :ref="'item_value_'+childItem.id" :name="get_child_input_name(childItem.id)">
                              
                            <a v-if="filter_array[childItem.id]!=undefined">
                              <div class="btn btn-success show_filter_box" v-on:click="show_filter_box(childItem.id)">انتخاب</div>
                              <input type="hidden"  :value="getFilterItemValue(filters[filter_array[childItem.id]].id)" class="filter_value" :name="get_filter_value_name(childItem.id)">
                              <div class="item_filter_box">
                                  <ul  :ref="'filter_box'+childItem.id">
                                      <li v-for="(filter_item,key) in filters[filter_array[childItem.id]].get_child" :key="key">
                                          <input type="checkbox" :checked="check(filter_item.id)"  :value="filter_item.id" v-on:click="checkSelected(filter_item.id,childItem.id,filter_item.title)">
                                          {{ filter_item.title }}
                                      </li>
                                  </ul>
                              </div>
                            </a>
                            <span v-else class="fa fa-plus-circle" v-on:click="add_item_value_input(childItem.id)"></span>

                            <div class="input_item_box" :id="'input_item_box_'+childItem.id">
                                <div class="form-group" v-for="(value,key) in childItem.get_value" :key="key">
                                    <div  v-if="key>0">
                                        <label></label>
                                        <input :name="get_child_input_name(childItem.id)" :value="value.item_value" type="text" class="form-control">
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                   </form>
                   <button class="btn btn-success" v-on:click="addItem()">ثبت اطلاعات</button>

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
import myMixin  from '../assets/myMixin';
export default {
    mixins:[myMixin],
    data(){
        return {
           server_error:false,
           showLoading:true,
           account_status:'active' ,
           BreadcrumbList:[
               { path:'/products',title:'مدیریت محصولات' },
               {path:'/products/'+this.$route.params.id+'/items',title:'مشخصات فنی محصول'}
           ],
           product_id:0,
           title:'',
           product_items:[],
           filters:[],
           product_filters:[],
           filter_array:[],
           show_alert_message:false,
           alert_message:''

        }
    },
    mounted(){
        this.account_status=localStorage.getItem('account_status');
        this.$emit('setSideBarItem','products');
        this.product_id=this.$route.params.id;
        this.getItems();
    },
    methods:{
        getItems:function(){
            const url=this.$siteUrl+'/api/seller/product/'+this.product_id+'/items';
            this.axios.get(url,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    if(response.data.title!=undefined)
                    {
                       this.product_items=response.data.product_items;
                       this.filters=response.data.filters;
                       this.product_filters=response.data.product_filters;
                       this.title=response.data.title;
                       this.filter_array=response.data.filter_array;
                    }
                    else if(response.data=='redirect')
                    {
                        this.$router.push({name:'ProductList'})
                    }
                    else
                    {
                        this.show_server_error(); 
                    }
                }
            }).catch((error)=>{
                this.setCatch(error);
            });
        },
        get_child_input_name:function(id)
        {
            return 'item_value['+id+'][]';
        },
        addItem:function(){
            this.showLoading=true;
            const form=document.querySelector('form');
            const data=new FormData(form);
            const url=this.$siteUrl+'/api/seller/product/'+this.product_id+'/items';
            this.axios.post(url,data,this.setHeader()).then(response=>{
                this.showLoading=false;
                const result=this.setAccountStatus(response.data);
                if(result)
                {
                    if(response.data=='ok')
                    {
                        this.show_alert_message=true;
                        this.alert_message='ثبت مشخصات فنی با موفقیت انجام شد';
                    }
                    else if(response.data=='redirect')
                    {
                        this.$router.push({name:'ProductList'})
                    }
                    else
                    {
                        this.show_server_error(); 
                    }
                }
                else
                {
                    this.show_server_error();    
                }
            }).catch((error)=>{
                this.setCatch(error);
            });
        },
        add_item_value_input:function(id){
          
            const html=document.createElement('div');
            html.setAttribute('style',"margin-top:10px");
            const label=document.createElement('label');
            html.appendChild(label);
            const input=document.createElement('input');
            input.setAttribute('name',this.get_child_input_name(id))
            input.setAttribute('class',"form-control");
            html.appendChild(input);
            document.getElementById('input_item_box_'+id).appendChild(html);
        },
        getFilterItemValue:function(id){
            let string='';
            for(let key in this.product_filters)
            {
                if(this.product_filters[key]==id)
                {
                    string=string+'@'+key;
                }
            }
            return string;
        },
        get_filter_value_name:function(id){
            
            return 'filter_value['+id+']['+this.filters[this.filter_array[id]].id+']';
        },
        show_filter_box:function(id)
        {
            const ref='filter_box'+id;
            if(this.$refs[ref][0].style.display=='block')
            {
                this.$refs[ref][0].style.display='none';
            }
            else{
                this.$refs[ref][0].style.display='block';
            }
        },
        checkSelected:function(filter_value,childItem,text)
        {
            const value=this.filters[this.filter_array[childItem]].id;
            const item_value=this.$refs['item_value_'+childItem][0];
            if(this.product_filters[filter_value]==undefined)
            {
                this.$set(this.product_filters,filter_value,value);
                if(item_value.value.trim()==''){
                    item_value.value=item_value.value+text
                }
                else{
                     item_value.value=item_value.value+','+text;
                }
               
            }
            else{
                this.$delete(this.product_filters,filter_value);
                item_value.value=item_value.value.replace(','+text,'');
            }
        },
        check:function(id){
            if(this.product_filters[id]==undefined)
            {
                return false;
            }
            else{
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