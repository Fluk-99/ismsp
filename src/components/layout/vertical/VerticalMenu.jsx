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
         <MenuItem href='/settings/Organization_V' icon={<>📂</>}>Organization</MenuItem>
            <MenuItem href='/settings/Department_V' icon={<>🏢</>}>Department</MenuItem>
            <MenuItem href='/settings/Employee' icon={<>👨‍💼</>}>Employee</MenuItem>
            <MenuItem href='/settings/Information-Classification' icon={<>📂</>}>Information Classification</MenuItem>
            <MenuItem href='/settings/Interested-Party' icon={<>🤝</>}>Interested Party</MenuItem>
            <MenuItem href='/settings/Organization-Chart' icon={<>📊</>}>Organization Chart</MenuItem>
            <MenuItem href='/settings/Process' icon={<>⚙️</>}>Process</MenuItem>
            <MenuItem href='/settings/Relationship' icon={<>🔗</>}>Relationship</MenuItem>
            <MenuItem href='/settings/SOA' icon={<>📜</>}>SOA</MenuItem>
        </SubMenu>



        <MenuItem href='/Clause4' icon={<i className='tabler-access-point' />}>
        Clause4
        </MenuItem>
        <MenuItem href='/Clause5' icon={<i className='tabler-award-filled' />}>
        Clause5
        </MenuItem>
        <SubMenu label='Clause7'>
          <MenuItem href='/Clause7/Resources' icon={<>👥</>}>Resources</MenuItem>
          <MenuItem href='/Clause7/Competence' icon={<>✅</>}>Competence</MenuItem>
          <MenuItem href='/Clause7/Awareness' icon={<>🔔</>}>Awareness</MenuItem>
          <MenuItem href='/Clause7/Communication' icon={<>📜</>}>Communication</MenuItem>
          <MenuItem href='/Clause7/d' icon={<>📜</>}>Documented Information</MenuItem>
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

