<template>
  <div>
      <loading v-if="showLoading"></loading>
      <Breadcrumb v-bind:data="BreadcrumbList"></Breadcrumb>
      <account-status :account_status="account_status"></account-status> 
        <div class="panel">
            
            <div class="header">
               گالری تصاویر - {{ title }}
            </div>
            <div class="panel_content">
                 <div v-if="account_status=='active'">

                <div v-if="show_alert_message" style="margin-bottom:10px" class="alert alert-success alert-dismissible fade show" role="alert">
                   <span>{{ alert_message }}</span>
                   <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                   </button>
                </div>

                   <vue-dropzone ref="myVueDropzone" @vdropzone-success="uploadSuccess"  id="dropzone" :options="dropzoneOptions">
                   </vue-dropzone>

                    <table class="table table-bordered" id="gallery_table">
                        <thead>
                          <tr>
                             <th>ردیف</th>
                             <th>تصویر</th>
                             <th>عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                           <tr v-for="(img,key) in gallery" :key="img.id" :id="img.id">
                              <td>{{ replaceNumber(++key) }}</td>
                              <td>
                                <img :src="$siteUrl+'/files/gallery/'+img.image_url">
                              </td>
                              <td>
                                <span class="fa fa-remove" v-on:click="remove_image(img.id,key)"></span>
                              </td>
                           </tr> 

                           <tr v-if="gallery.length==0">
                             <td colspan="3">رکوردی یافت نشد</td>
                           </tr>
                        </tbody>
                    </table>

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
                <p id="msg">آیا از حذف این تصویر مطمئن هستین ؟</p>
                <a class="alert alert-success" v-on:click="remove_image_of_list">بله</a>
                <a class="alert alert-danger" v-on:click="showMessageDialog=!showMessageDialog">خیر</a>
             </div>
       </div> 
      <server-error-message v-if="server_error"></server-error-message>  
  </div>
</template>

<script>
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
const token=localStorage.getItem('token');
import myMixin from '../assets/myMixin';
import 'jquery-ui';
export default {
  mixins:[myMixin],
  components: {
    vueDropzone: vue2Dropzone
  },
  data(){
    return {
       server_error:false,
       showLoading:true,
       account_status:'active',
       BreadcrumbList:[
          { path:'/products',title:'مدیریت محصولات' },
          { path:'/products/'+this.$route.params.id+'/gallery',title:'گالری تصاویر محصول' },
       ],
       title:'',
        dropzoneOptions: {
          url:this.$siteUrl+'/api/seller/product/'+this.$route.params.id+'/gallery',
          thumbnailWidth:200,
          maxFilesize:1,
          acceptedFiles:'.png,.jpg,.jpeg',
          addRemoveLinks: true,
          headers: { "authorization": "Bearer "+token , "accept":"application/json" ,
                        },
          dictDefaultMessage:'با کشیدن فایل و انداختن در این قسمت میتواند تصاویر خود را اپلود کنید'
      },
      gallery:[],
      selected_key:0,
      selected_id:0,
      showMessageDialog:false,
      show_alert_message:false,
      alert_message:'حذف تصویر با موفقیت انجام شد',
      product_id:0
    }
  },
  mounted(){
    this.$emit('setSideBarItem','products');
    this.getGallery();
    const $sortable=$("#gallery_table > tbody");
    const app=this;
    this.product_id=this.$route.params.id;
    /* global $ */
    $sortable.sortable({
        stop:function () {
           app.showLoading=true;
           const parameters=$sortable.sortable("toArray");
           const url=app.$siteUrl+'/api/seller/product/gallery/change_images_position/'+app.product_id;
           const formData=new FormData();
           formData.append('parameters',parameters);
           app.axios.post(url,formData,app.setHeader()).then(response=>{
               app.showLoading=false;
               const result=app.setAccountStatus(response.data);
               if(result)
               {
                  if(response.data=='error')
                  {
                    this.show_server_error();
                  }  
               }
           }).catch((error)=>{
               app.setCatch(error);
           });
        }
     });
  },
  methods:{
    uploadSuccess:function(file,response)
    {
      if(response['status']!=undefined)
      {
         this.gallery.push({id:response['id'],'image_url':response['image_url']});
      }
    },
    getGallery:function()
    {
       const url=this.$siteUrl+'/api/seller/product/'+this.$route.params.id+'/gallery';
       this.axios.get(url,this.setHeader()).then(response=>{
          this.showLoading=false;
          const result=this.setAccountStatus(response.data);
          if(result)
          {
              if(response.data.title!=undefined)
              {
                this.title=response.data.title;
                this.gallery=response.data.product_gallery;
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
    remove_image:function(id,key)
    {
       key=key-1;
       this.selected_id=id;
       this.selected_key=key;
       this.showMessageDialog=true;
    },
    remove_image_of_list:function()
    {
        this.show_alert_message=false;
        this.showMessageDialog=false;
        this.showLoading=true;
        const url=this.$siteUrl+'/api/seller/product/gallery/'+this.selected_id;
        this.axios.delete(url,this.setHeader()).then(response=>{
          this.showLoading=false;
          const result=this.setAccountStatus(response.data);
          if(result)
          {
              if(response.data['status']=='ok')
              {
                 this.show_alert_message=true;
                 this.$delete(this.gallery,this.selected_key);
              }
              else{
                this.show_server_error();
              }
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
        },
  }
}
</script>

<style>

</style>