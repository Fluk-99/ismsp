// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        ///src/app/dashboard/settings/Department.jsx
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>
          Home
        </MenuItem>
        <MenuItem href='/about' icon={<i className='tabler-info-circle' />}>
          About
        </MenuItem>
        <SubMenu label='Settings'>
          <MenuItem href='/settings/Organization_V' icon={<>📂</>}>
            Organization
          </MenuItem>
          <MenuItem href='/settings/Department_V' icon={<>🏢</>}>
            Department
          </MenuItem>
          <MenuItem href='/settings/Employee_V' icon={<>👨‍💼</>}>
            Employee
          </MenuItem>
          <MenuItem href='/settings/InformationClassification_V' icon={<>📂</>}>
            Information Classification
          </MenuItem>
          <MenuItem href='/settings/InterestedParty_V' icon={<>🤝</>}>
            Interested Party
          </MenuItem>
          <MenuItem href='/settings/OrganizationChart_V' icon={<>📊</>}>
            Organization Chart
          </MenuItem>
          <MenuItem href='/settings/Process_V' icon={<>⚙️</>}>
            Process
          </MenuItem>
          <MenuItem href='/settings/Relationship_V' icon={<>🔗</>}>
            Relationship
          </MenuItem>
          <MenuItem href='/settings/SOA_V' icon={<>📜</>}>
            SOA
          </MenuItem>
        </SubMenu>
        <SubMenu label='Clause4' icon={<i className='tabler-award-filled' />}>
          <MenuItem href='/Clause4/Boundary'>Boundary</MenuItem>
          <MenuItem href='/Clause4/Factor'>Factor</MenuItem>
          <MenuItem href='/Clause4/FullInterestedParties'>FullInterested Parties</MenuItem>
          <MenuItem href='/Clause4/ScopeStatement'>Scope Statement</MenuItem>
        </SubMenu>

        <SubMenu label='Clause5' icon={<i className='tabler-award-filled' />}>
          <MenuItem href='/Clause5/LeadershipCommitment'>Leadership Commitment</MenuItem>
          <MenuItem href='/Clause5/InformationSecurityPolicy'>Information Security Policy</MenuItem>
          <MenuItem href='/Clause5/ismsRole'>ismsRole</MenuItem>
        </SubMenu>

        <SubMenu label='Clause6' icon={<i className='tabler-award-filled' />}>
          <MenuItem href='/Clause6/Actions_to_Address_Risks_and_Opportunities' icon={<>👥</>}>
            Actions to Address Risks and Opportunities
          </MenuItem>
          <MenuItem href='/Clause6/Information Security_Objectives_and_Planning_to_Achieve_Them' icon={<>👥</>}>
            Information Security Objectives and Planning to Achieve Them
          </MenuItem>
          <MenuItem href='/Clause6/Planning_of_Changes' icon={<>👥</>}>
            Planning of Changes
          </MenuItem>
        </SubMenu>

        <SubMenu label='Clause7' icon={<i className='tabler-award-filled' />}>
          <MenuItem href='/Clause7/Resources' icon={<>👥</>}>
            Resources
          </MenuItem>
          <MenuItem href='/Clause7/Competence' icon={<>✅</>}>
            Competence
          </MenuItem>

          <MenuItem href='/Clause7/Awareness' icon={<>🔔</>}>
            Awareness
          </MenuItem>
          <MenuItem href='/Clause7/Communication' icon={<>📜</>}>
            Communication
          </MenuItem>
          <MenuItem href='/Clause7/Documented_information' icon={<>📜</>}>
            Documented Information
          </MenuItem>
        </SubMenu>

        <MenuItem href='/Clause8' icon={<i className='tabler-award-filled' />}>
          Clause8
        </MenuItem>
        <SubMenu label='Clause9' icon={<i className='tabler-award-filled' />}>
          <MenuItem href='/Clause9/Monitoring' icon={<>?</>}>
            Monitoring
          </MenuItem>
          <SubMenu label='Internal Audit'>
            <MenuItem href='/Clause9/Audit_Checklist' icon={<>?</>}>
              Audit Checklist
            </MenuItem>
            <MenuItem href='/Clause9/Internal_Audit' icon={<>?</>}>
              Internal Audit
            </MenuItem>
          </SubMenu>
          <MenuItem href='/Clause9/Management_Review' icon={<>?</>}>
            Management Review
          </MenuItem>
        </SubMenu>
        <SubMenu label='Clause10' icon={<i className='tabler-award-filled' />}>
          <MenuItem href='/Clause10/Corrective_Actions' icon={<>?</>}>
            Corrective Actions
          </MenuItem>
          <MenuItem href='/Clause10/Continual_Improvement' icon={<>?</>}>
            Continual Improvement
          </MenuItem>
        </SubMenu>
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 23 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary)} />
        </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
