import {
  Airplay,
  BarChart,
  Box,
  MessageCircle,
  CheckSquare,
  Clock,
  Cloud,
  Command,
  Edit,
  FileText,
  Film,
  FolderPlus,
  GitPullRequest,
  Heart,
  HelpCircle,
  Home,
  Image,
  Layers,
  List,
  Mail,
  Map,
  Monitor,
  Package,
  Radio,
  Server,
  Sunrise,
  Users,
  Zap,
  Settings,
  ShoppingBag,
  User,
  LogIn,
  DollarSign,
  CreditCard,
  UserCheck
} from "react-feather";
import RequestIcon from "./Request.svg"
import QuoteIcon from "./Quote.svg"
import { FaDonate } from "react-icons/fa"

export const MENU = [
  {
    className: "menu-box",
    menu: [
      {
        title: "Dashboards",
        icon: <Home />,
        type: "link",
        url: `${window.location.origin}/dashboard/default`,
        // class: "lan-3",
        // removed sub menu
        // menu: [
        //   {
        //     title: "Default",
        //     url: `${window.location.origin}/dashboard/default`,
        //     class: "lan-4",
        //     type: "link",
        //   },
        //   {
        //     title: "Ecommerce",
        //     url: `${window.location.origin}/dashboard/ecommerce`,
        //     type: "link",
        //     class: "lan-5",
        //   },
        // ],
      },
      // {
      //   title: "Widgets",
      //   icon: <Airplay />,
      //   class: "lan-6",
      //   menu: [
      //     {
      //       url: `${window.location.origin}/widgets/general`,
      //       type: "link",
      //       title: "General",
      //     },
      //     {
      //       url: `${window.location.origin}/widgets/chart`,
      //       type: "link",
      //       title: "Chart",
      //     },
      //   ],
      // },
      // {
      //   title: "Ecommerce",
      //   icon: <ShoppingBag />,
      //   type: "link",
      //   url: `${window.location.origin}/dashboard/ecommerce`,
      // type: "sub",
      // menu: [
      //   {
      //     url: `${window.location.origin}/ecommerce/product`,
      //     title: "Product",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/product-page/1`,
      //     title: "Product Page",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/product-list`,
      //     title: "Product List",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/Add-product`,
      //     title: "Add Product",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/payment-details`,
      //     title: "Payment Detail",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/orderhistory`,
      //     title: "Order History",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/pricing`,
      //     title: "Pricing",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/invoice`,
      //     title: "Invoice",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/cart`,
      //     title: "Cart",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/checkout`,
      //     title: "Checkout",
      //     type: "link",
      //   },
      //   {
      //     url: `${window.location.origin}/ecommerce/whishlist`,
      //     title: "Wishlist",
      //     type: "link",
      //   },
      // ],
      // },
      {
        title: "Transactions",
        icon: <CreditCard />,
        type: "link",
        url: `${window.location.origin}/transactions`,
      },
      {
        title: "Payments",
        icon: <DollarSign />,
        type: "link",
        url: `${window.location.origin}/payments`,
      },
      {
        title: "Beneficiaries",
        icon: <UserCheck />,
        type: "link",
        url: `${window.location.origin}/beneficiaries`,
      },
      // {
      //   title: "Referrals",
      //   icon: <User />,
      //   type: "link",
      //   url: `${window.location.origin}/users/userCards`,
      // },
      {
        title: "Referrals",
        icon: <User />,
        type: "link",
        url: `${window.location.origin}/referrals`,
      },
      // {
      //   title: "Requests",
      //   icon: <img src={RequestIcon} style={{ marginRight: "12px" }} />,
      //   type: "link",
      //   url: `${window.location.origin}/requests`,
      // },
      // {
      //   title: "Quotations",
      //   icon: <img src={QuoteIcon} style={{ marginRight: "12px" }} />,
      //   type: "link",
      //   url: `${window.location.origin}/quotations`,
      // },
      {
        title: "Payment Requests",
        icon: <img src={RequestIcon} style={{ marginRight: "12px" }} />,
        type: "link",
        url: `${window.location.origin}/payment-requests`,
      },
      {
        title: "Chips In",
        // icon: <img src={RequestIcon} style={{ marginRight: "12px" }} />,
        icon: <FaDonate size={24} />,
        type: "link",
        url: `${window.location.origin}/chips-in`,
      },
      // {
      //   title: "Profile Settings",
      //   icon: <Settings />,
      //   type: "link",
      //   url: `${window.location.origin}/users/userEdit`,
      // },
      // {
      //   title: "Logout",
      //   icon: <LogIn />,
      //   type: "link",
      //   url: `${window.location.origin}/Login`,
      // }
    ],
  },
  // {
  //   className: "menu-box",
  //   menu: [
  //     {
  //       title: "Chat",
  //       icon: <MessageCircle />,
  //       menu: [
  //         {
  //           url: `${window.location.origin}/chat-app`,
  //           type: "link",
  //           title: "Chat App",
  //         },
  //         {
  //           url: `${window.location.origin}/video-chat-app`,
  //           type: "link",
  //           title: "Video App",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Email",
  //       icon: <Mail />,
  //       menu: [
  //         {
  //           url: `${window.location.origin}/email-app`,
  //           type: "link",
  //           title: "Mail Inbox",
  //         },
  //         {
  //           url: `${window.location.origin}/email/readmail`,
  //           type: "link",
  //           title: "Read Mail",
  //         },
  //         {
  //           url: `${window.location.origin}/email-app/compose`,
  //           type: "link",
  //           title: "Compose",
  //         },
  //       ],
  //     },
  //     {
  //       url: `${window.location.origin}/file-manager`,
  //       icon: <GitPullRequest />,
  //       title: "File Manager",
  //       type: "link",
  //       bookmark: true,
  //     },
  //     {
  //       url: `${window.location.origin}/kanban-board`,
  //       icon: <Monitor />,
  //       type: "link",
  //       title: "Kanban Board",
  //     },
  //     {
  //       url: `${window.location.origin}/bookmark`,
  //       icon: <Heart />,
  //       bookmark: true,
  //       type: "link",
  //       title: "Bookmark",
  //     },
  //     {
  //       url: `${window.location.origin}/contact`,
  //       icon: <List />,
  //       type: "link",
  //       title: "Contacts",
  //     },
  //     {
  //       url: `${window.location.origin}/task`,
  //       icon: <CheckSquare />,
  //       type: "link",
  //       title: "Task",
  //     },
  //     {
  //       url: `${window.location.origin}/social-app`,
  //       icon: <Zap />,
  //       title: "Social App",
  //       type: "link",
  //       bookmark: true,
  //     },

  //     {
  //       url: `${window.location.origin}/todo-app/todo`,
  //       icon: <Clock />,
  //       type: "link",
  //       title: "To-Do",
  //     },
  //   ],
  // },
  // {
  //   className: "menu-box",
  //   menu: [
  //     {
  //       title: "Forms",
  //       icon: <FileText />,
  //       menu: [
  //         {
  //           title: "Form Controls",
  //           menu: [
  //             {
  //               title: "Form Validation",
  //               type: "link",
  //               url: `${window.location.origin}/forms/form-validation`,
  //             },
  //             {
  //               title: "Basic Input",
  //               type: "link",
  //               url: `${window.location.origin}/forms/baseInput`,
  //             },
  //             {
  //               title: "Checkbox & Radio",
  //               type: "link",
  //               url: `${window.location.origin}/forms/radio-checkbox`,
  //             },
  //             {
  //               title: "Input Groups",
  //               type: "link",
  //               url: `${window.location.origin}/forms/inputGroup`,
  //             },
  //             {
  //               title: "Mega Option",
  //               type: "link",
  //               url: `${window.location.origin}/forms/megaOptions`,
  //             },
  //           ],
  //         },
  //         {
  //           title: "Form Widgets",
  //           menu: [
  //             {
  //               title: "Datepicker",
  //               type: "link",

  //               url: `${window.location.origin}/form-widget/datepicker`,
  //             },
  //             {
  //               title: "Typeahead",
  //               type: "link",

  //               url: `${window.location.origin}/form-widget/typeahead`,
  //             },
  //             {
  //               title: "Rangepicker",
  //               type: "link",

  //               url: `${window.location.origin}/form-widget/rangepicker`,
  //             },
  //             {
  //               title: "Touchspin",
  //               type: "link",

  //               url: `${window.location.origin}/form-widget/touchspin`,
  //             },
  //             {
  //               title: "Select2",
  //               type: "link",

  //               url: `${window.location.origin}/form-widget/select`,
  //             },
  //             {
  //               title: "Switch",
  //               type: "link",

  //               url: `${window.location.origin}/form-widget/switch`,
  //             },
  //             {
  //               title: "Clipboard",
  //               type: "link",

  //               url: `${window.location.origin}/form-widget/clipboard`,
  //             },
  //           ],
  //         },
  //         {
  //           title: "Form Layout",
  //           menu: [
  //             {
  //               url: `${window.location.origin}/form-layout/formDefault`,
  //               type: "link",
  //               title: "Form Default",
  //             },
  //             {
  //               url: `${window.location.origin}/form-layout/formWizard`,
  //               type: "link",
  //               title: "Form Wizard",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       title: "Tables",
  //       icon: <Server />,
  //       menu: [
  //         {
  //           title: "React Strap Table",
  //           url: `${window.location.origin}/table/reactstraptable`,
  //           type: "link",
  //         },
  //         {
  //           title: "Data Tables",
  //           type: "link",
  //           url: `${window.location.origin}/table/datatable`,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   className: "menu-box",
  //   menu: [
  //     {
  //       title: "Ui-Kits",
  //       icon: <Box />,
  //       menu: [
  //         {
  //           url: `${window.location.origin}/ui-kits/typography`,
  //           title: "Typography",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/avatar`,
  //           title: "Avatars",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/helperclass`,
  //           title: "Helper-Classes",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/grid`,
  //           title: "Grid",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/tagsandpills`,
  //           title: "Tag & Pills",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/progress-bar`,
  //           title: "Progress",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/modal`,
  //           title: "Modal",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/alert`,
  //           title: "Alert",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/popover`,
  //           title: "Popover",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/tooltips`,
  //           title: "Tooltip",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/spinner`,
  //           title: "Spinners",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/dropdown`,
  //           title: "Dropdown",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/accordion`,
  //           title: "Accordion",
  //           type: "link",
  //         },
  //         {
  //           title: "Tabs",
  //           type: "sub",
  //           menu: [
  //             {
  //               title: "Bootstrap Tabs",
  //               type: "link",
  //               url: `${window.location.origin}/ui-kits/tab-bootstrap`,
  //             },
  //             {
  //               title: "Line Tabs",
  //               type: "link",
  //               url: `${window.location.origin}/ui-kits/tab-line`,
  //             },
  //           ],
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/shadow`,
  //           title: "Shadow",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/ui-kits/list`,
  //           title: "List",
  //           type: "link",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Bonus Ui",
  //       type: "sub",
  //       icon: <FolderPlus />,
  //       menu: [
  //         {
  //           url: `${window.location.origin}/bonus-ui/scrollable`,
  //           type: "link",
  //           title: "Scrollable",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/treeview`,
  //           type: "link",
  //           title: "Tree",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/rating`,
  //           type: "link",
  //           title: "Rating",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/dropzone`,
  //           type: "link",
  //           title: "Dropzone",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/tourComponent`,
  //           type: "link",
  //           title: "Tour",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/sweetAlert`,
  //           type: "link",
  //           title: "SweetAlert",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/ribbons`,
  //           type: "link",
  //           title: "Ribbons",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/pagination`,
  //           type: "link",
  //           title: "Pagination",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/breadcrumb`,
  //           type: "link",
  //           title: "Breadcrumb",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/rangeSlider`,
  //           type: "link",
  //           title: "Range Slider",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/imageCropper`,
  //           type: "link",
  //           title: "Image Cropper",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/stickyNotes`,
  //           type: "link",
  //           title: "Sticky",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/dragNDropComp`,
  //           type: "link",
  //           title: "Drag and Drop",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/image-upload`,
  //           type: "link",
  //           title: "Upload",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/card/basicCards`,
  //           type: "link",
  //           title: "Basic Card",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/card/draggingCards`,
  //           type: "link",
  //           title: "Draggable Card",
  //         },
  //         {
  //           url: `${window.location.origin}/bonus-ui/timelines/timeline1`,
  //           type: "link",
  //           title: "Timeline",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Icons",
  //       icon: <Command />,
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/icons/flagIcons`,
  //           type: "link",
  //           title: "Flag Icon",
  //         },
  //         {
  //           url: `${window.location.origin}/icons/fontAwsomeIcon`,
  //           type: "link",
  //           title: "Font awesome Icon",
  //         },
  //         {
  //           url: `${window.location.origin}/icons/icoIcons`,
  //           type: "link",
  //           title: "Ico Icon",
  //         },
  //         {
  //           url: `${window.location.origin}/icons/themifyIcons`,
  //           type: "link",
  //           title: "Themify Icon",
  //         },
  //         {
  //           url: `${window.location.origin}/icons/featherIcons`,
  //           type: "link",
  //           title: "Feather Icon",
  //         },
  //         {
  //           url: `${window.location.origin}/icons/weatherIcons`,
  //           type: "link",
  //           title: "Whether Icon",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Buttons",
  //       icon: <Cloud />,
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/buttons/default-btn`,
  //           type: "link",
  //           title: "Default Style",
  //         },
  //         {
  //           url: `${window.location.origin}/buttons/groupBtn`,
  //           type: "link",
  //           title: "Button Group",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Charts",
  //       icon: <BarChart />,
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/charts/apexCharts`,
  //           type: "link",
  //           title: "Apex Chart",
  //         },
  //         {
  //           url: `${window.location.origin}/charts/googleChart`,
  //           type: "link",
  //           title: "Google Chart",
  //         },
  //         {
  //           url: `${window.location.origin}/charts/chartJs`,
  //           type: "link",
  //           title: "Chartjs",
  //         },
  //         {
  //           url: `${window.location.origin}/charts/chartistComponent`,
  //           type: "link",
  //           title: "Chartist",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   className: "menu-box",
  //   menu: [
  //     {
  //       url: `${window.location.origin}/samplepage`,
  //       icon: <Layers />,
  //       title: "Sample Page",
  //       type: "sub",
  //     },
  //     {
  //       title: "Others",
  //       icon: <Layers />,
  //       type: "sub",
  //       menu: [
  //         {
  //           title: "Error Page",
  //           type: "sub",
  //           menu: [
  //             {
  //               title: "Error Page 1",
  //               type: "link",
  //               url: `${window.location.origin}/error/error-page1`,
  //             },
  //             {
  //               title: "Error Page 2",
  //               type: "link",
  //               url: `${window.location.origin}/error/error-page2`,
  //             },
  //             {
  //               title: "Error Page 3",
  //               type: "link",
  //               url: `${window.location.origin}/error/error-page3`,
  //             },
  //             {
  //               title: "Error Page 4",
  //               type: "link",
  //               url: `${window.location.origin}/error/error-page4`,
  //             },
  //             {
  //               title: "Error Page 5",
  //               type: "link",
  //               url: `${window.location.origin}/error/error-page5`,
  //             },
  //           ],
  //         },
  //         {
  //           title: "Coming Soon",
  //           type: "sub",

  //           menu: [
  //             {
  //               title: "Coming Sample",
  //               type: "link",
  //               url: `${window.location.origin}/coming/comingsimple`,
  //             },
  //             {
  //               title: "Coming with Bg-video",
  //               type: "link",
  //               url: `${window.location.origin}/coming/comingbgvideo`,
  //             },
  //             {
  //               title: "Coming with Bg-Image",
  //               type: "link",
  //               url: `${window.location.origin}/coming/comingbgimage`,
  //             },
  //           ],
  //         },
  //         {
  //           title: "Authentication",
  //           type: "sub",

  //           menu: [
  //             {
  //               title: "Login Simple",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/login-simple`,
  //             },
  //             {
  //               title: "Login With bg image",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/login-img`,
  //             },
  //             {
  //               title: "Login with image two",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/login-bg-img`,
  //             },
  //             {
  //               title: "Login with validation",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/login-validation`,
  //             },
  //             {
  //               title: "Login with tooltip",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/login-tooltip`,
  //             },
  //             {
  //               title: "Login with sweetaleart",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/login-sweetalert`,
  //             },
  //             {
  //               type: "link",
  //               title: "Register Simple",

  //               url: `${window.location.origin}/authentication/register-simpleimg`,
  //             },
  //             {
  //               title: "Register with Bg image",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/register-bg-img`,
  //             },
  //             {
  //               title: "Register with Bg Video",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/register-video`,
  //             },
  //             {
  //               title: "Unlock User",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/unlock-user`,
  //             },
  //             {
  //               title: "Forgot Password",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/forget-pwd`,
  //             },
  //             {
  //               title: "Create Passward",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/create-pwd`,
  //             },
  //             {
  //               title: "Maintenance",
  //               type: "link",

  //               url: `${window.location.origin}/authentication/maintenance`,
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },

  // {
  //   className: "menu-box",
  //   menu: [
  //     {
  //       icon: <Image />,
  //       title: "Gallery",
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/gallery/imageGallery`,
  //           title: "Gallery Grid",
  //           type: "link",
  //         },
  //         {
  //           url: `${window.location.origin}/gallery/imageWithDesc`,
  //           type: "link",
  //           title: "Gallery Grid  Desc",
  //         },
  //         {
  //           url: `${window.location.origin}/gallery/mesonryGallery`,
  //           type: "link",
  //           title: "Masonry Gallery",
  //         },
  //         {
  //           url: `${window.location.origin}/gallery/mesonryDesc`,
  //           type: "link",
  //           title: "Masonry With Desc",
  //         },
  //         {
  //           url: `${window.location.origin}/gallery/imageHover`,
  //           type: "link",
  //           title: "Hover Effect",
  //         },
  //       ],
  //     },
  //     {
  //       icon: <Film />,
  //       title: "Blog",
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/blog/blogDetail`,
  //           type: "link",
  //           title: "Blog Details",
  //         },
  //         {
  //           url: `${window.location.origin}/blog/blogSingle`,
  //           type: "link",
  //           title: "Blog Single",
  //         },
  //         {
  //           url: `${window.location.origin}/blog/blogPost`,
  //           type: "link",
  //           title: "Add Post",
  //         },
  //       ],
  //     },
  //     {
  //       icon: <Package />,
  //       title: "Job Search",
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/jobSearch/cardView`,
  //           type: "link",
  //           title: "Cards View",
  //         },
  //         {
  //           url: `${window.location.origin}/jobSearch/job-list`,
  //           type: "link",
  //           title: "List View",
  //         },
  //         {
  //           url: `${window.location.origin}/jobSearch/job-detail`,
  //           type: "link",
  //           title: "Job Details",
  //         },
  //         {
  //           url: `${window.location.origin}/jobSearch/job-apply`,
  //           type: "link",
  //           title: "Apply",
  //         },
  //       ],
  //     },
  //     {
  //       icon: <Radio />,
  //       title: "Learning",
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/learning/learning-list`,
  //           type: "link",
  //           title: "Learning List",
  //         },
  //         {
  //           url: `${window.location.origin}/learning/learning-detail`,
  //           type: "link",
  //           title: "Detail Course",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Maps",
  //       icon: <Map />,
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/map/googleMap`,
  //           type: "link",
  //           title: "Google Maps",
  //         },
  //         {
  //           url: `${window.location.origin}/map/pigeonMap`,
  //           type: "link",
  //           title: "Pigeon Maps",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Editor",
  //       icon: <Edit />,
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/editor/ckEditor`,
  //           type: "link",
  //           title: "CK  Editor",
  //         },
  //         {
  //           url: `${window.location.origin}/editor/mdeEditor`,
  //           type: "link",
  //           title: "MDE Editor",
  //         },
  //         {
  //           url: `${window.location.origin}/editor/acecodeeditor`,
  //           type: "link",
  //           title: "ACE code editor",
  //         },
  //       ],
  //     },
  //     {
  //       url: `${window.location.origin}/faq`,
  //       icon: <HelpCircle />,
  //       title: "FAQ",
  //       type: "link",
  //     },
  //     {
  //       title: "knowledgebase",
  //       icon: <Sunrise />,
  //       type: "sub",
  //       menu: [
  //         {
  //           url: `${window.location.origin}/knowledgebase/knowledgebase`,
  //           type: "link",
  //           title: "knowledgebase",
  //         },
  //         {
  //           url: `${window.location.origin}/knowledgebase/KnowledgeCategory`,
  //           type: "link",
  //           title: "KnowledgeCategory",
  //         },
  //         {
  //           url: `${window.location.origin}/knowledgebase/KnowledgeDetailContain`,
  //           type: "link",
  //           title: "KnowledgeDetail",
  //         },
  //       ],
  //     },
  //     {
  //       url: `${window.location.origin}/support-ticket`,
  //       icon: <Users />,
  //       type: "link",
  //       title: "Support Ticket",
  //     },
  //   ],
  // },
];
export const SEARCHMENU = [
  {
    className: "menu-box",
    menu: [
      {
        title: "Dashboards",
        icon: <Home />,
        type: "link",
        url: `${window.location.origin}/dashboard/default`,
      },
      {
        title: "Transactions",
        icon: <CreditCard />,
        type: "link",
        url: `${window.location.origin}/transactions`,
      },
      {
        title: "Payments",
        icon: <DollarSign />,
        type: "link",
        url: `${window.location.origin}/ecommerce/payment-details`,
      },
      {
        title: "Referrals",
        icon: <User />,
        type: "link",
        url: `${window.location.origin}/users/userCards`,
      },
      //     {
      //       title: "Dashboards",
      //       icon: <Home />,
      //       class: "lan-3",
      //       menu: [
      //         {
      //           title: "Default",
      //           url: `${window.location.origin}/dashboard/default`,
      //           class: "lan-4",
      //           type: "link",
      //         },
      //         {
      //           title: "Ecommerce",
      //           url: `${window.location.origin}/dashboard/ecommerce`,
      //           type: "link",
      //           class: "lan-5",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Widgets",
      //       icon: <Airplay />,
      //       class: "lan-6",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/widgets/general`,
      //           type: "link",
      //           title: "General",
      //           bookmark: true,
      //         },
      //         {
      //           url: `${window.location.origin}/widgets/chart`,
      //           type: "link",
      //           title: "Chart",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Ecommerce",
      //       icon: <ShoppingBag />,
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/ecommerce/product`,
      //           title: "Product",
      //           type: "link",
      //           bookmark: true,
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/product-page/1`,
      //           title: "Product Page",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/product-list`,
      //           title: "Product List",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/Add-product`,
      //           title: "Add Product",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/payment-details`,
      //           title: "Payment Detail",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/orderhistory`,
      //           title: "Order History",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/pricing`,
      //           title: "Pricing",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/invoice`,
      //           title: "Invoice",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/cart`,
      //           title: "Cart",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/checkout`,
      //           title: "Checkout",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ecommerce/whishlist`,
      //           title: "Wishlist",
      //           type: "link",
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   className: "menu-box",
      //   menu: [
      //     {
      //       title: "Chat",
      //       icon: <MessageCircle />,
      //       menu: [
      //         {
      //           url: `${window.location.origin}/chat-app`,
      //           type: "link",
      //           title: "Chat App",
      //         },
      //         {
      //           url: `${window.location.origin}/video-chat-app`,
      //           type: "link",
      //           title: "Video App",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Email",
      //       icon: <Mail />,
      //       menu: [
      //         {
      //           url: `${window.location.origin}/email-app`,
      //           type: "link",
      //           title: "Mail Inbox",
      //         },
      //         {
      //           url: `${window.location.origin}/email/readmail`,
      //           type: "link",
      //           title: "Read Mail",
      //         },
      //         {
      //           url: `${window.location.origin}/email-app/compose`,
      //           type: "link",
      //           title: "Compose",
      //         },
      //       ],
      //     },
      //     {
      //       url: `${window.location.origin}/file-manager`,
      //       icon: <GitPullRequest />,
      //       title: "File Manager",
      //       type: "link",
      //       bookmark: true,
      //     },
      //     {
      //       url: `${window.location.origin}/kanban-board`,
      //       icon: <Monitor />,
      //       type: "link",
      //       title: "Kanban Board",
      //     },
      //     {
      //       url: `${window.location.origin}/bookmark`,
      //       icon: <Heart />,
      //       bookmark: true,
      //       type: "link",
      //       title: "Bookmark",
      //     },
      //     {
      //       url: `${window.location.origin}/contact`,
      //       icon: <List />,
      //       type: "link",
      //       title: "Contacts",
      //     },
      //     {
      //       url: `${window.location.origin}/task`,
      //       icon: <CheckSquare />,
      //       type: "link",
      //       title: "Task",
      //     },
      //     {
      //       url: `${window.location.origin}/social-app`,
      //       icon: <Zap />,
      //       title: "Social App",
      //       type: "link",
      //       bookmark: true,
      //     },

      //     {
      //       url: `${window.location.origin}/todo-app/todo`,
      //       icon: <Clock />,
      //       type: "link",
      //       title: "To-Do",
      //     },
      //   ],
      // },
      // {
      //   className: "menu-box",
      //   menu: [
      //     {
      //       title: "Forms",
      //       icon: <FileText />,
      //       menu: [
      //         {
      //           title: "Form Controls",
      //           menu: [
      //             {
      //               title: "Form Validation",
      //               type: "link",
      //               url: `${window.location.origin}/forms/form-validation`,
      //             },
      //             {
      //               title: "Basic Input",
      //               type: "link",
      //               url: `${window.location.origin}/forms/baseInput`,
      //             },
      //             {
      //               title: "Checkbox & Radio",
      //               type: "link",
      //               url: `${window.location.origin}/forms/radio-checkbox`,
      //             },
      //             {
      //               title: "Input Groups",
      //               type: "link",
      //               url: `${window.location.origin}/forms/inputGroup`,
      //             },
      //             {
      //               title: "Mega Option",
      //               type: "link",
      //               url: `${window.location.origin}/forms/megaOptions`,
      //             },
      //           ],
      //         },
      //         {
      //           title: "Form Widgets",
      //           menu: [
      //             {
      //               title: "Datepicker",
      //               type: "link",
      //               bookmark: true,
      //               url: `${window.location.origin}/form-widget/datepicker`,
      //             },
      //             {
      //               title: "Typeahead",
      //               type: "link",

      //               url: `${window.location.origin}/form-widget/typeahead`,
      //             },
      //             {
      //               title: "Rangepicker",
      //               type: "link",

      //               url: `${window.location.origin}/form-widget/rangepicker`,
      //             },
      //             {
      //               title: "Touchspin",
      //               type: "link",

      //               url: `${window.location.origin}/form-widget/touchspin`,
      //             },
      //             {
      //               title: "Select2",
      //               type: "link",

      //               url: `${window.location.origin}/form-widget/select`,
      //             },
      //             {
      //               title: "Switch",
      //               type: "link",

      //               url: `${window.location.origin}/form-widget/switch`,
      //             },
      //             {
      //               title: "Clipboard",
      //               type: "link",

      //               url: `${window.location.origin}/form-widget/clipboard`,
      //             },
      //           ],
      //         },
      //         {
      //           title: "Form Layout",
      //           menu: [
      //             {
      //               url: `${window.location.origin}/form-layout/formDefault`,
      //               type: "link",
      //               title: "Form Default",
      //             },
      //             {
      //               url: `${window.location.origin}/form-layout/formWizard`,
      //               type: "link",
      //               title: "Form Wizard",
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       title: "Tables",
      //       icon: <Server />,
      //       menu: [
      //         {
      //           title: "React Strap Table",
      //           url: `${window.location.origin}/table/reactstraptable`,
      //           type: "link",
      //         },
      //         {
      //           title: "Data Tables",
      //           type: "link",
      //           url: `${window.location.origin}/table/datatable`,
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   className: "menu-box",
      //   menu: [
      //     {
      //       title: "Ui-Kits",
      //       icon: <Box />,
      //       menu: [
      //         {
      //           url: `${window.location.origin}/ui-kits/typography`,
      //           title: "Typography",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/avatar`,
      //           title: "Avatars",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/helperclass`,
      //           title: "Helper-Classes",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/grid`,
      //           title: "Grid",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/tagsandpills`,
      //           title: "Tag & Pills",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/progress-bar`,
      //           title: "Progress",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/modal`,
      //           title: "Modal",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/alert`,
      //           title: "Alert",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/popover`,
      //           title: "Popover",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/tooltips`,
      //           title: "Tooltip",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/spinner`,
      //           title: "Spinners",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/dropdown`,
      //           title: "Dropdown",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/accordion`,
      //           title: "Accordion",
      //           type: "link",
      //         },
      //         {
      //           title: "Tabs",
      //           type: "sub",
      //           menu: [
      //             {
      //               title: "Bootstrap Tabs",
      //               type: "link",
      //               url: `${window.location.origin}/ui-kits/tab-bootstrap`,
      //             },
      //             {
      //               title: "Line Tabs",
      //               type: "link",
      //               url: `${window.location.origin}/ui-kits/tab-line`,
      //             },
      //           ],
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/shadow`,
      //           title: "Shadow",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/ui-kits/list`,
      //           title: "List",
      //           type: "link",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Bonus Ui",
      //       type: "sub",
      //       icon: <FolderPlus />,
      //       menu: [
      //         {
      //           url: `${window.location.origin}/bonus-ui/scrollable`,
      //           type: "link",
      //           title: "Scrollable",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/treeview`,
      //           type: "link",
      //           title: "Tree",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/rating`,
      //           type: "link",
      //           title: "Rating",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/dropzone`,
      //           type: "link",
      //           title: "Dropzone",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/tourComponent`,
      //           type: "link",
      //           title: "Tour",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/sweetAlert`,
      //           type: "link",
      //           title: "SweetAlert",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/ribbons`,
      //           type: "link",
      //           title: "Ribbons",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/pagination`,
      //           type: "link",
      //           title: "Pagination",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/breadcrumb`,
      //           type: "link",
      //           title: "Breadcrumb",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/rangeSlider`,
      //           type: "link",
      //           title: "Range Slider",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/imageCropper`,
      //           type: "link",
      //           title: "Image Cropper",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/stickyNotes`,
      //           type: "link",
      //           title: "Sticky",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/dragNDropComp`,
      //           type: "link",
      //           title: "Drag and Drop",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/image-upload`,
      //           type: "link",
      //           title: "Upload",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/card/basicCards`,
      //           type: "link",
      //           title: "Basic Card",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/card/draggingCards`,
      //           type: "link",
      //           title: "Draggable Card",
      //         },
      //         {
      //           url: `${window.location.origin}/bonus-ui/timelines/timeline1`,
      //           type: "link",
      //           title: "Timeline",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Icons",
      //       icon: <Command />,
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/icons/flagIcons`,
      //           type: "link",
      //           title: "Flag Icon",
      //         },
      //         {
      //           url: `${window.location.origin}/icons/fontAwsomeIcon`,
      //           type: "link",
      //           title: "Font awesome Icon",
      //         },
      //         {
      //           url: `${window.location.origin}/icons/icoIcons`,
      //           type: "link",
      //           title: "Ico Icon",
      //         },
      //         {
      //           url: `${window.location.origin}/icons/themifyIcons`,
      //           type: "link",
      //           title: "Themify Icon",
      //         },
      //         {
      //           url: `${window.location.origin}/icons/featherIcons`,
      //           type: "link",
      //           title: "Feather Icon",
      //         },
      //         {
      //           url: `${window.location.origin}/icons/weatherIcons`,
      //           type: "link",
      //           title: "Whether Icon",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Buttons",
      //       icon: <Cloud />,
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/buttons/default-btn`,
      //           type: "link",
      //           title: "Default Style",
      //         },
      //         {
      //           url: `${window.location.origin}/buttons/groupBtn`,
      //           type: "link",
      //           title: "Button Group",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Charts",
      //       icon: <BarChart />,
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/charts/apexCharts`,
      //           type: "link",
      //           title: "Apex Chart",
      //           bookmark: true,

      //         },
      //         {
      //           url: `${window.location.origin}/charts/googleChart`,
      //           type: "link",
      //           title: "Google Chart",
      //         },
      //         {
      //           url: `${window.location.origin}/charts/chartJs`,
      //           type: "link",
      //           title: "Chartjs",
      //         },
      //         {
      //           url: `${window.location.origin}/charts/chartistComponent`,
      //           type: "link",
      //           title: "Chartist",
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   className: "menu-box",
      //   menu: [
      //     {
      //       url: `${window.location.origin}/samplepage`,
      //       icon: <Layers />,
      //       title: "Sample Page",
      //       type: "sub",
      //     },
      //     {
      //       title: "Others",
      //       icon: <Layers />,
      //       type: "sub",
      //       menu: [
      //         {
      //           title: "Error Page",
      //           type: "sub",
      //           menu: [
      //             {
      //               title: "Error Page 1",
      //               type: "link",
      //               url: `${window.location.origin}/error/error-page1`,
      //             },
      //             {
      //               title: "Error Page 2",
      //               type: "link",
      //               url: `${window.location.origin}/error/error-page2`,
      //             },
      //             {
      //               title: "Error Page 3",
      //               type: "link",
      //               url: `${window.location.origin}/error/error-page3`,
      //             },
      //             {
      //               title: "Error Page 4",
      //               type: "link",
      //               url: `${window.location.origin}/error/error-page4`,
      //             },
      //             {
      //               title: "Error Page 5",
      //               type: "link",
      //               url: `${window.location.origin}/error/error-page5`,
      //             },
      //           ],
      //         },
      //         {
      //           title: "Coming Soon",
      //           type: "sub",

      //           menu: [
      //             {
      //               title: "Coming Sample",
      //               type: "link",
      //               url: `${window.location.origin}/coming/comingsimple`,
      //             },
      //             {
      //               title: "Coming with Bg-video",
      //               type: "link",
      //               url: `${window.location.origin}/coming/comingbgvideo`,
      //             },
      //             {
      //               title: "Coming with Bg-Image",
      //               type: "link",
      //               url: `${window.location.origin}/coming/comingbgimage`,
      //             },
      //           ],
      //         },
      //         {
      //           title: "Authentication",
      //           type: "sub",

      //           menu: [
      //             {
      //               title: "Login Simple",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/login-simple`,
      //             },
      //             {
      //               title: "Login With bg image",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/login-img`,
      //             },
      //             {
      //               title: "Login with image two",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/login-bg-img`,
      //             },
      //             {
      //               title: "Login with validation",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/login-validation`,
      //             },
      //             {
      //               title: "Login with tooltip",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/login-tooltip`,
      //             },
      //             {
      //               title: "Login with sweetaleart",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/login-sweetalert`,
      //             },
      //             {
      //               type: "link",
      //               title: "Register Simple",

      //               url: `${window.location.origin}/authentication/register-simpleimg`,
      //             },
      //             {
      //               title: "Register with Bg image",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/register-bg-img`,
      //             },
      //             {
      //               title: "Register with Bg Video",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/register-video`,
      //             },
      //             {
      //               title: "Unlock User",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/unlock-user`,
      //             },
      //             {
      //               title: "Forgot Password",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/forget-pwd`,
      //             },
      //             {
      //               title: "Create Passward",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/create-pwd`,
      //             },
      //             {
      //               title: "Maintenance",
      //               type: "link",

      //               url: `${window.location.origin}/authentication/maintenance`,
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },

      // {
      //   className: "menu-box",
      //   menu: [
      //     {
      //       icon: <Image />,
      //       title: "Gallery",
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/gallery/imageGallery`,
      //           title: "Gallery Grid",
      //           type: "link",
      //         },
      //         {
      //           url: `${window.location.origin}/gallery/imageWithDesc`,
      //           type: "link",
      //           title: "Gallery Grid  Desc",
      //         },
      //         {
      //           url: `${window.location.origin}/gallery/mesonryGallery`,
      //           type: "link",
      //           title: "Masonry Gallery",
      //         },
      //         {
      //           url: `${window.location.origin}/gallery/mesonryDesc`,
      //           type: "link",
      //           title: "Masonry With Desc",
      //         },
      //         {
      //           url: `${window.location.origin}/gallery/imageHover`,
      //           type: "link",
      //           title: "Hover Effect",
      //         },
      //       ],
      //     },
      //     {
      //       icon: <Film />,
      //       title: "Blog",
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/blog/blogDetail`,
      //           type: "link",
      //           title: "Blog Details",
      //         },
      //         {
      //           url: `${window.location.origin}/blog/blogSingle`,
      //           type: "link",
      //           title: "Blog Single",
      //         },
      //         {
      //           url: `${window.location.origin}/blog/blogPost`,
      //           type: "link",
      //           title: "Add Post",
      //         },
      //       ],
      //     },
      //     {
      //       icon: <Package />,
      //       title: "Job Search",
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/jobSearch/cardView`,
      //           type: "link",
      //           title: "Cards View",
      //         },
      //         {
      //           url: `${window.location.origin}/jobSearch/job-list`,
      //           type: "link",
      //           title: "List View",
      //         },
      //         {
      //           url: `${window.location.origin}/jobSearch/job-detail`,
      //           type: "link",
      //           title: "Job Details",
      //         },
      //         {
      //           url: `${window.location.origin}/jobSearch/job-apply`,
      //           type: "link",
      //           title: "Apply",
      //         },
      //       ],
      //     },
      //     {
      //       icon: <Radio />,
      //       title: "Learning",
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/learning/learning-list`,
      //           type: "link",
      //           title: "Learning List",
      //         },
      //         {
      //           url: `${window.location.origin}/learning/learning-detail`,
      //           type: "link",
      //           title: "Detail Course",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Maps",
      //       icon: <Map />,
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/map/googleMap`,
      //           type: "link",
      //           title: "Google Maps",
      //         },
      //         {
      //           url: `${window.location.origin}/map/pigeonMap`,
      //           type: "link",
      //           title: "Pigeon Maps",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Editor",
      //       icon: <Edit />,
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/editor/ckEditor`,
      //           type: "link",
      //           title: "CK  Editor",
      //         },
      //         {
      //           url: `${window.location.origin}/editor/mdeEditor`,
      //           type: "link",
      //           title: "MDE Editor",
      //         },
      //         {
      //           url: `${window.location.origin}/editor/acecodeeditor`,
      //           type: "link",
      //           title: "ACE code editor",
      //         },
      //       ],
      //     },
      //     {
      //       url: `${window.location.origin}/faq`,
      //       icon: <HelpCircle />,
      //       title: "FAQ",
      //       type: "link",
      //     },
      //     {
      //       title: "knowledgebase",
      //       icon: <Sunrise />,
      //       type: "sub",
      //       menu: [
      //         {
      //           url: `${window.location.origin}/knowledgebase/knowledgebase`,
      //           type: "link",
      //           title: "knowledgebase",
      //         },
      //         {
      //           url: `${window.location.origin}/knowledgebase/KnowledgeCategory`,
      //           type: "link",
      //           title: "KnowledgeCategory",
      //         },
      //         {
      //           url: `${window.location.origin}/knowledgebase/KnowledgeDetailContain`,
      //           type: "link",
      //           title: "KnowledgeDetail",
      //         },
      //       ],
      //     },
      //     {
      //       url: `${window.location.origin}/support-ticket`,
      //       icon: <Users />,
      //       type: "link",
      //       title: "Support Ticket",
      //     },
    ],
  },
];

