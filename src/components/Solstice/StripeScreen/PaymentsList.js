import * as React from 'react' ;

import Loading from 'react-loading-components' ;

import { connect } from 'react-redux' ;
import { AutoCheckPayments } from '../../../firebase/payment_collection';

import { getUnit } from '../../../utils/Helper';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import {
    Box,
    TableContainer, 
    Table, 
    TableBody, 
    TableHead, 
    TableRow, 
    TableCell,
    TableFooter,
    TablePagination,
    Tooltip,
} from '@mui/material' ;

import { useStyles } from './StylesDiv/PaymentsList.styles';
import { useTheme } from '@mui/styles';

import { toast } from 'react-toastify/dist/react-toastify';

let timer ;

const PaymentsList = (props) => {
    const classes = useStyles() ;
    const theme = useTheme() ;

    const {
        searchStr,
        allPaymentsList,
    } = props ;

    const headFields = [
        "Creator",
        "Solstice name",
        "Profile",
        "Product Name",
        "Type",
        "Price",
        "Permission",
        "Status"
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
    
    const resetTimer = async (paymentsList) => {
        clearInterval(timer) ;
        timer = setInterval(async () => {
            await AutoCheckPayments(paymentsList) ;
        }, 5000) ;
    }

    React.useEffect(() => {
        return () => {
            clearInterval(timer) ;
        }
    }, []) ;

    React.useEffect(() => {
        if(allPaymentsList) {
            resetTimer(allPaymentsList) ;
            // let temp = buyersList.filter((item) => 
            //     item.email.toLowerCase().search(searchStr.toLowerCase()) >= 0 ||
            //     item.username.toLowerCase().search(searchStr.toLowerCase()) >= 0 ||
            //     item.fullname.toLowerCase().search(searchStr.toLowerCase()) >= 0
            // ) ;

            setFilterList(Object.entries(allPaymentsList)) ;
        } 
    }, [searchStr, allPaymentsList]) ;

    return (
       <>
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
                                        filterList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(([id, payment_intent]) => {
                                            return(
                                                <TableRow key={id} >
                                                    <TableCell>
                                                       <Box sx={{display : 'flex', flexDirection : 'column', justifyContent : 'center'}}>
                                                            <Box>
                                                                {<img src={payment_intent.creator_profile_picture_url} width={45} height={45}/>}
                                                            </Box>
                                                            <Box>
                                                                {payment_intent.creator_account_name}
                                                            </Box>
                                                       </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            {payment_intent.creator_full_name}
                                                        </Box>
                                                        <Box>
                                                            {payment_intent.creator_email}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={payment_intent.creator_profile_link || 'Lock'} >
                                                            <Box className={classes.hrefDiv} onClick={() => {
                                                                window.open(payment_intent.creator_profile_link, "_blank")
                                                            }}>
                                                                {
                                                                    payment_intent.creator_profile_link?.slice(0 , 17)
                                                                }...
                                                            </Box>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>{payment_intent.product_name}</TableCell>
                                                    <TableCell sx={{textTransform : 'capitalize'}}>{payment_intent.price_type}</TableCell>
                                                    <TableCell>
                                                        {payment_intent.product_price}&nbsp;{ getUnit(payment_intent.price_unit) }
                                                    </TableCell>
                                                    <TableCell sx={{textTransform : 'capitalize'}}>{payment_intent.buyer_permission}</TableCell>
                                                    <TableCell>{payment_intent.status}</TableCell>
                                                </TableRow>
                                            )
                                        })
                                    : <TableRow  >
                                        <TableCell colSpan={8}  sx={{textAlign : 'center'}}>
                                            <Box sx={{color : theme.palette.green.G100}}>
                                                <SearchOffIcon />
                                                <Box>There aren't any bids.</Box>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : 
                                <TableRow  >
                                    <TableCell colSpan={8} sx={{textAlign : 'center'}}>
                                        <Loading type='three_dots' width={50} height={50} fill='#43D9AD' />
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 15]}
                                    labelRowsPerPage={"Payments per page"}
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
PaymentsList.propTypes = {
}
const mapStateToProps = state => ({
    allPaymentsList : state.payment.allPaymentsList
})
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentsList) ;