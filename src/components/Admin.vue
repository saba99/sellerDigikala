<template>
  <div class="admin_panel container-fluid">
    <loading v-if="showLoading"></loading>

    <div class="page_sidebar" id="page_sidebar">
      <span class="fa fa-bars" v-on:click="Toggled()" id="sidebarToggle"></span>
      <ul id="sidebar_menu">
        <li>
          <a v-bind:href="$siteUrl">
            <span class="fa fa-globe"></span>
            <span class="sidebar_menu_text">مشاهده فروشگاه</span>
          </a>
        </li>
        <li>
          <a
            v-on:click="show_child_menu('products')"
            :class="active_item=='products' ? 'active_li' : ''"
          >
            <span class="fa fa-shopping-cart"></span>
            <span class="sidebar_menu_text">محصولات</span>
            <span class="fa fa-angle-left"></span>
          </a>
          <div
            :class="active_item=='products' ? 'active_child child_menu' : 'child_menu'"
            ref="products"
          >
            <router-link :to="$base_url+'/products'">مدیریت محصولات</router-link>
            <router-link :to="$base_url+'/products/add'">افزودن محصول جدید</router-link>
          </div>
        </li>
        <li>
          <router-link :to="$base_url+'/orders'" :class="active_item=='orders' ? 'active_li' : ''">
            <span class="fa fa-list"></span>
            <span class="sidebar_menu_text">سفارشات</span>
          </router-link>
        </li>
        <li>
          <a
            v-on:click="show_child_menu('report')"
            :class="active_item=='report' ? 'active_li' : ''"
          >
            <span class="fa fa-line-chart"></span>
            <span class="sidebar_menu_text">گزارشات</span>
            <span class="fa fa-angle-left"></span>
          </a>
          <div
            :class="active_item=='report' ? 'active_child child_menu' : 'child_menu'"
            ref="report"
          >
            <router-link :to="$base_url+'/orders/sale_statistics'">آمار فروش</router-link>
            <router-link :to="$base_url+'/orders/payments'">مدیریت پرداخت ها</router-link>
          </div>
        </li>

        <li>
          <a
            v-on:click="show_child_menu('package')"
            :class="active_item=='package' ? 'active_li' : ''"
          >
            <span class="fa fa-ambulance"></span>
            <span class="sidebar_menu_text">انبار</span>
            <span class="fa fa-angle-left"></span>
          </a>
          <div
            :class="active_item=='package' ? 'active_child child_menu' : 'child_menu'"
            ref="package"
          >
            <router-link :to="$base_url+'/package/inventory'">موجودی های انبار</router-link>
            <router-link :to="$base_url+'/package'">مدیریت محموله ها</router-link>
            <router-link :to="$base_url+'/package/add'">افزودن محموله جدید</router-link>
          </div>
        </li>
        <li>
          <router-link :to="$base_url+'/messages'" :class="active_item=='messages' ? 'active_li' : ''">
            <span class="fa fa-comment-o"></span>
            <span class="sidebar_menu_text">مدیریت پیام ها</span>
          </router-link>
        </li>
        <li>
          <a
            v-on:click="show_child_menu('setting')"
            :class="active_item=='setting' ? 'active_li' : ''"
          >
            <span class="fa fa-cogs"></span>
            <span class="sidebar_menu_text">تنظیمات</span>
            <span class="fa fa-angle-left"></span>
          </a>
          <div
            :class="active_item=='setting' ? 'active_child child_menu' : 'child_menu'"
            ref="setting"
          >
            <router-link :to="$base_url+'/setting/profile'">ویرایش پروفایل</router-link>
          </div>
        </li>
        <li>
          <a
            v-on:click="logout_dialog()"
            :to="$base_url+'/orders'"
            :class="active_item=='logout' ? 'active_li' : ''"
          >
            <span class="fa fa-sign-out"></span>
            <span class="sidebar_menu_text">خروج</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="page_content" id="page_content">
      <div class="page_header">
        <div>
          <span>{{ brand_name }}</span>
        </div>
        <ul></ul>
      </div>
      <div class="content_box">
        <router-view @setSideBarItem="setSideBarItem" @updateInfo="updateInfo"></router-view>
      </div>
    </div>

    <div class="message_div" v-if="showMessageDialog">
      <div class="message_box">
        <p id="msg">آیا میخواهید از پنل مدیریت خارج شوید</p>

        <a class="alert alert-success" v-on:click="logoutUser()">بله</a>
        <a class="alert alert-danger" v-on:click="showMessageDialog=!showMessageDialog">خیر</a>
      </div>
    </div>

    <server-error-message v-if="server_error"></server-error-message>
  </div>
</template>

<script>
import myMixin from "../assets/myMixin";
import ServerErrorMessage from "./ServerErrorMessage";
export default {
  mixins: [myMixin],
  components: { ServerErrorMessage },
  data() {
    return {
      active_item: "",
      showMessageDialog: false,
      showLoading: false,
      server_error: false,
      brand_name: ""
    };
  },
  mounted() {
    const getUserData = this.$route.params.getUserData;
    
    if (getUserData == "yes") {
      this.showLoading = true;
    
    //((this.getSellerInfo()));
    const token = localStorage.getItem('token');
        
        const url = this.$siteUrl + '/api/seller/profile';
      
        this.axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(response => {
             
            this.showLoading = false;
            if (response.data.seller.account_status != undefined) {
                this.brand_name = response.data.brand_name;
                localStorage.setItem('account_status', response.data.seller.account_status);
                localStorage.setItem('brand_name', response.data.seller.brand_name);
                localStorage.setItem('seller_id', response.data.seller.id);
                this.updateInfo();
            }
        }).catch(() => {
            
            this.getSellerInfo();
        });
    } else {
      if (localStorage.getItem("brand_name") != undefined) {
        this.brand_name = localStorage.getItem("brand_name");
      }
    }
  },
  methods: {
    hide_child_mene: function() {
      const child_menu = document.getElementsByClassName("child_menu");
      for (let i = 0; i < child_menu.length; i++) {
        child_menu[i].style.display = "none";
        child_menu[i].classList.remove("active_child");
      }
    },
    show_child_menu: function($ref) {
      this.hide_child_mene();
      const sidebar_menu = document
        .getElementById("sidebar_menu")
        .getElementsByTagName("li");
      for (let j = 0; j < sidebar_menu.length; j++) {
        sidebar_menu[j]
          .getElementsByTagName("a")[0]
          .classList.remove("active_li");
      }
      this.$refs[$ref].style.display = "block";
      this.$refs[$ref].parentElement
        .getElementsByTagName("a")[0]
        .classList.add("active_li");
    },
    setSideBarItem: function(item) {
      this.active_item = item;
    },
    Toggled: function() {
      const class_name = document.getElementById("page_sidebar").className;
      if (class_name == "page_sidebar") {
        document.getElementById("page_sidebar").classList.add("toggled");
        this.hide_child_mene();
        document.getElementById("page_content").style.marginRight = "50px";
      } else {
        document.getElementById("page_sidebar").classList.remove("toggled");
        document.getElementById("page_content").style.marginRight = "240px";
        if (document.getElementsByClassName("active_li").length == 1) {
          document
            .getElementsByClassName("active_li")[0]
            .parentElement.getElementsByClassName(
              "child_menu"
            )[0].style.display = "block";
        }
      }
    },
    logout_dialog: function() {
      this.showMessageDialog = true;
    },
    logoutUser: function() {
      const token = localStorage.getItem("token");
      
      this.showMessageDialog = false;
      this.showLoading = true;
      const url = this.$siteUrl + "/api/seller/logout";
      this.axios
        .post(url, {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token
          }
        })
        .then(response => {
          this.showLoading = false;
          alert(response.data);
          if (response.data == "ok") {
            this.logout();
          } else {
            this.show_server_error();
          }
        })
        .catch(error => {
          if (error.response.status == 401) {
            this.logout();
          } else {
            this.showLoading = false;
            this.show_server_error();
          }
        });
    },
    updateInfo:function(){
      this.brand_name = localStorage.getItem("brand_name");
    },
    
  }
};
</script>

