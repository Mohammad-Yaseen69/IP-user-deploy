import { ChevronDown } from 'react-feather'
import { Link } from 'react-router-dom'
import { LI, UL } from '../../../AbstractElements'

const HeaderDashboard = () => {
  return (
      <LI attrLI={{ className: "onhover-dropdown" }}>
        <span className="f-w-600">Dashboard</span>
        <span><ChevronDown className="middle" /></span>
        <UL attrUL={{ className: "simple-list onhover-show-div left-dropdown" }}>
          <LI><Link to={`${window.location.origin}/dashboard/default`}>Index</Link></LI>
          <LI><Link to={`${window.location.origin}/dashboard/ecommerce`}> Ecommerce</Link></LI>
        </UL>
      </LI>
  )
}

export default HeaderDashboard