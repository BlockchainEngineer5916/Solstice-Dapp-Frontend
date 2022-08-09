import * as React from 'react' ;

import Loading from 'react-loading-components' ;

import { connect } from 'react-redux' ;
import { UserAccountInfo } from '../../../redux/actions/profile';
import PropTypes from 'prop-types' ;

import { getCookie, getUuid } from '../../../utils/Helper';

import ReloadImage from '../../../assets/common/Reload.png' ;

import {
    Box,
    Grid,
    TableContainer, 
    Table, 
    TableBody, 
    TableHead, 
    TableRow, 
    TableCell,
    TableFooter,
    TablePagination,
    Tooltip
} from '@mui/material' ;

import { useStyles } from './StylesDiv/CustomersList.styles';
import { useTheme } from '@mui/styles';

const CustomersList = (props) => {
    const classes = useStyles() ;
    const theme = useTheme() ;

    const {
        searchStr,
        customersList,

        UserAccountInfo
    } = props ;

    const headFields = [
        "Full Name",
        "User Name",
        "Email",
        "Profile Link",
    ]

    const [filterList, setFilterList] = React.useState(null) ;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    
    // React.useEffect(() => {
    //     if(customersList) {
    //         let temp = Object.entries(customersList).filter(([id, item]) => 
    //             item.email.toLowerCase().search(searchStr.toLowerCase()) >= 0 ||
    //             item.username.toLowerCase().search(searchStr.toLowerCase()) >= 0 ||
    //             item.fullname.toLowerCase().search(searchStr.toLowerCase()) >= 0
    //         ) ;

    //         setFilterList(temp) ;
    //     } 
    // }, [searchStr, customersList]) ;

    React.useEffect(() => {
        UserAccountInfo(getCookie('_SOLSTICE_AUTHUSER')) ;
    }, []) ;

    React.useEffect(() => {
        if(customersList) {
            let temp = customersList.filter((item) => 
                item.email.toLowerCase().search(searchStr.toLowerCase()) >= 0 ||
                item.username.toLowerCase().search(searchStr.toLowerCase()) >= 0 ||
                item.fullname.toLowerCase().search(searchStr.toLowerCase()) >= 0
            ) ;

            setFilterList(temp) ;
        } 
    }, [customersList, searchStr]) ;

    const handleReload = async () => {
        setFilterList(null) ;
        await UserAccountInfo(getCookie('_SOLSTICE_AUTHUSER')) ;
    } ;

    return (
       <>
            <Grid container>
                <Grid item xs={12} sx={{paddingRight : '50px', display : 'flex', justifyContent : 'flex-end'}}>
                    {
                        filterList ? <Tooltip title={'Reload'} >
                            <Box sx={{display : 'flex', alignItems : 'flex-end', gap : '10px', color : theme.palette.green.G200, fontSize : '20px', cursor : 'pointer'}} onClick={handleReload}>
                                <img src={ReloadImage} width={27} height={27} /> Refresh
                            </Box>
                        </Tooltip>
                        : <Box sx={{display : 'flex', alignItems : 'flex-end', gap : '10px', color : theme.palette.green.G200, fontSize : '20px', cursor : 'pointer'}}>
                           <Loading type='oval' width={27} height={27} fill='#2eb6ec' /> Reloading
                        </Box>
                    }
                </Grid>
            </Grid>
            <Box className={classes.root}>
                <TableContainer sx={{paddingRight:"5px",}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {
                                    headFields.map((field, index) => {
                                        return (
                                            <TableCell key={index}>{ field }</TableCell>
                                        )
                                    })
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                filterList ? (
                                    filterList.length ? 
                                        filterList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customerInfo, index) => {
                                            return(
                                                <TableRow key={index} >
                                                    <TableCell sx={{minWidth : '150px'}}>{customerInfo.full_name}</TableCell>
                                                    <TableCell>{customerInfo.account_name}</TableCell>
                                                    <TableCell>{customerInfo.email}</TableCell>
                                                    <TableCell sx={{minWidth : '150px', textAlign:'left !important'}}>{customerInfo.profile_link}</TableCell>
                                                </TableRow>
                                            )
                                        })
                                    : <TableRow  >
                                        <TableCell colSpan={10}  sx={{textAlign : 'center'}}>No Customers</TableCell>
                                    </TableRow>
                                ) : 
                                <TableRow  >
                                    <TableCell colSpan={10} sx={{textAlign : 'center'}}>
                                        <Loading type='three_dots' width={50} height={50} fill='#43D9AD' />
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 15]}
                                    labelRowsPerPage={"Customers per page"}
                                    count={
                                        filterList 
                                        ? filterList.length
                                        : 0
                                    }
                                    SelectProps={{
                                        MenuProps : {
                                            classes : {
                                                paper :  classes.paper
                                            }
                                        }
                                    }}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />    
                            </TableRow>
                        
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Box>
       </>
    )
}
CustomersList.propTypes = {
    UserAccountInfo : PropTypes.func.isRequired
}
const mapStateToProps = state => ({
    customersList : state.profile.customers
})
const mapDispatchToProps = {
    UserAccountInfo
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomersList) ;