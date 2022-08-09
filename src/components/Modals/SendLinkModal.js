import * as React from 'react' ;

import { connect } from 'react-redux';

import { SendPaymentLink } from '../../email';

import CloseIcon from '@mui/icons-material/Close';
import validator from 'validator';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Loading from 'react-loading-components' ;

import swal from 'sweetalert';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';

import  {
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    Box,
    Button,
    Grid,
    TextField,
    InputAdornment,
    Tooltip
} from '@mui/material' ;

import { useStyles } from './StylesDiv/SendLink.styles';
import { useTheme } from '@mui/styles';

console.log(process.env.REACT_APP_EMAIL_TEMPLATE_ID);
const SendLinkModal = (props) => {

    const classes = useStyles() ;
    const theme = useTheme() ;

    const linkCtrl = React.useRef(null) ;

    const {
        open,
        handleClose,

        productInfo,
        creator_email,
        creator_name,
        customersList
    } = props ;

    const [receiverEmail, setReceiverEmail] = React.useState('') ;
    const [isCopied , setIsCopied] = React.useState(false) ;
    const [loading, setLoading] = React.useState(false) ;
    const [filterList, setFilterList] = React.useState(null) ;
    const [searchStr, setSearchStr] = React.useState('') ;
    const [selectedItem, setSelectedItem] = React.useState(null) ;

    const handleSendLink = async () => {
        setLoading(true) ;
        await SendPaymentLink(
            "https://solsapp.com/product-intro?linkId=" + productInfo?.intro_link,
            productInfo,
            creator_name,
            creator_email,
            receiverEmail
        )

        swal({
            title : 'Product Link url sent successfully',
            text : 'You sent product url to ' + receiverEmail ,
            buttons : false,
            icon : 'info',
            timer : 5000
        }) ;

        setLoading(false) ;
        handleClose() ;
    }

    const emitCopyEvent = () => {
        setIsCopied(true) ;
        linkCtrl.current.select() ;
        document.execCommand("copy");
    }

    React.useEffect(async () => {
        
    }, [productInfo]) ;

    React.useEffect(async () => {
        if(customersList) {
            let temp = customersList.filter( customer => customer.full_name.toLowerCase().search(searchStr.toLowerCase()) >= 0 
                                            || customer.account_name.toLowerCase().search(searchStr.toLowerCase()) >= 0
                                            || customer.email.toLowerCase().search(searchStr.toLowerCase()) >= 0
            );
            
            setFilterList([...temp]) ;
        }
    }, [customersList, searchStr]) ;

    React.useEffect(() => {
        if(selectedItem !== null) {
            setReceiverEmail(filterList[selectedItem].email) ;
        }
    }, [selectedItem]) ;

    React.useEffect(() => {
        console.log(filterList) ;
    }, [filterList]) ;
    
    return (
        <Box className={classes.root}>
            <Dialog
                open={open}
                fullWidth
                classes ={{
                    paper : classes.paper
                }}
                hideBackdrop={true}
            >
                <Box className={classes.greenBlur} />
                <Box className={classes.blueBlur} />
                <DialogTitle>
                    <Box>
                        Product : { productInfo?.product_name }
                    </Box>
                    <CloseIcon onClick={handleClose} sx={{cursor : 'pointer'}} className={classes.closeButtonCss} />
                </DialogTitle>
                <Box className={classes.dividerDiv} />
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box className={classes.labelDiv}>URL</Box>
                            <Box sx={{fontSize : '20px',}}>
                                <TextField
                                    size='small'
                                    fullWidth
                                    value={"https://solsapp.com/product-intro?linkId=" + productInfo?.intro_link || ''}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            <Tooltip title={isCopied ? "Copied" : 'Copy'}>
                                                <Box className={classes.copyDiv}  onClick={() => emitCopyEvent()} onMouseLeave={() => setIsCopied(false)}>
                                                    <ContentCopyIcon fontSize={"small"}  />
                                                </Box>
                                            </Tooltip>
                                        </InputAdornment>,
                                    }}
                                />
                                <Box sx={{position : 'fixed', top : '10000px !important', right: '10000px !important'}}>
                                    <input type={'text'} defaultValue={"https://solsapp.com/product-intro?linkId=" + productInfo?.intro_link || ''} ref={linkCtrl}/>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sx={{mt : '30px'}}>
                            <Box className={classes.labelDiv}>Customer List</Box>
                            <TextField
                                placeholder='Search customer by email or name'
                                size='small'
                                fullWidth
                                onChange={(e) => setSearchStr(e.target.value)}
                                value={searchStr}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">
                                        <ManageSearchIcon/>
                                    </InputAdornment>,
                                }}
                            />
                            <Box className={classes.listDiv}>
                                {
                                    filterList ? 
                                        filterList.length ? filterList.map( (customer, index) => {
                                            return (
                                                <Box key={index} className={classes.listItemDiv} onClick={() => setSelectedItem(index)}>
                                                    <Box>{ customer.email }</Box>
                                                    { selectedItem === index && <DoneOutlineIcon fontSize={'small'}/> }
                                                </Box>
                                            )
                                        })
                                        : <Box className={classes.emptyDiv}>
                                            <SearchOffIcon />
                                            <Box>There aren't any customers.</Box>
                                    </Box>
                                    : <Box className={classes.emptyDiv}>
                                            <Loading type='three_dots' width={50} height={50} fill='#43D9AD' />
                                    </Box>
                                }
                            </Box>
                        </Grid>
                        <Grid item xs={12} sx={{mt : '30px'}}>
                            <Box className={classes.labelDiv}>Receiver Email</Box>
                            <Box >
                                <TextField
                                    size='small'
                                    fullWidth
                                    onChange={(e) => setReceiverEmail(e.target.value)}
                                    value={receiverEmail}
                                    helperText={!validator.isEmail(receiverEmail) && receiverEmail !== '' ? 'Invalid Email' : ''}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Box className={classes.dividerDiv} />
                <DialogActions>
                    <Button variant={'contained'} onClick={handleSendLink} 
                        disabled={!validator.isEmail(receiverEmail) || !productInfo || loading}
                        startIcon={ loading && <Loading type='tail_spin' width={30} height={30} fill='#e83e8c' />}
                    >
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

const mapStateToProps = state => ({
    creator_email : state.profile.email,
    creator_name : state.profile.accountName,
    customersList : state.profile.customers
})
const mapDispatchToProps = {
}
export default connect(mapStateToProps, mapDispatchToProps)(SendLinkModal) ;