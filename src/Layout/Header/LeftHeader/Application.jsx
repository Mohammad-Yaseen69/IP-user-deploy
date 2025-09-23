import { Link } from "react-router-dom";
import { NavLink } from "reactstrap";
import { ChevronDown } from 'react-feather'
import { LI, UL } from "../../../AbstractElements";
import {Href} from "../../../Constant"
const Appliacation = () => {
  return (
    <LI attrLI={{ className: "onhover-dropdown" }}>
      <span className="f-w-600">Application</span>
      <span><ChevronDown className="middle" /></span>
      <UL attrUL={{ className: "onhover-show-div left-dropdown" }}>
        <LI attrLI={{ className: "flyout-right" }}>
          <NavLink href={Href}>Project </NavLink>
          <UL>
            <LI><Link to={`${window.location.origin}/project/project-list`}>Project List</Link></LI>
            <LI><Link to={`${window.location.origin}/project/new-project`}>Project Create</Link></LI>
          </UL>
        </LI>
        <LI><NavLink to={`${window.location.origin}/file-manager`}>File manager</NavLink></LI>
        <LI><Link to={`${window.location.origin}/kanban-board`}>kanban</Link></LI>
        <LI attrLI={{ className: "flyout-right" }}>
          <NavLink href={Href}> Ecommerce</NavLink>
          <UL>
            <LI><Link to={`${window.location.origin}/ecommerce/product`}>Product</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/product-page/1`}>Product Page</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/product-list`}> Product List</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/payment-details`}> Payment Details</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/orderhistory`}> Order History</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/invoice`}>Invoice</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/cart`}>Cart</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/whishlist`}> Wishlist</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/checkout`}> Checkout</Link></LI>
            <LI><Link to={`${window.location.origin}/ecommerce/pricing`}> Pricing </Link></LI>
          </UL>
        </LI>
        <LI attrLI={{ className: "flyout-right" }}>
          <NavLink href={Href}> Email</NavLink>
          <UL>
            <LI><Link to={`${window.location.origin}/email-app`}>Mail Inbox</Link></LI>
            <LI><Link to={`${window.location.origin}/email/readmail`}>Read Mail</Link></LI>
            <LI><Link to={`${window.location.origin}/email-app/compose`}>Compose</Link></LI>
          </UL>
        </LI>
        <LI attrLI={{ className: "flyout-right" }}>
          <NavLink href={Href}>Chat </NavLink>
            <UL>
              <LI><Link to={`${window.location.origin}/chat-app`}>Chat App</Link></LI>
              <LI><Link to={`${window.location.origin}/video-chat-app`}>Video Chat</Link></LI>
            </UL>
        </LI>
        <LI attrLI={{ className: "flyout-right" }}>
          <NavLink href={Href}>Users</NavLink>
          <UL>
            <LI><Link to={`${window.location.origin}/users/userProfile`}>User Profile</Link></LI>
            <LI><Link to={`${window.location.origin}/users/userEdit`}>Users Edit</Link></LI>
            <LI><Link to={`${window.location.origin}/users/userCards`}>User Cards</Link></LI>
          </UL>
        </LI>
        <LI><Link to={`${window.location.origin}/bookmark`}>Bookmarks</Link></LI>
        <LI><Link to={`${window.location.origin}/contact`}>Contacts</Link></LI>
        <LI><Link to={`${window.location.origin}/social-app`}>Social App</Link>
        </LI>
      </UL>
    </LI>
  );
};

export default Appliacation;
