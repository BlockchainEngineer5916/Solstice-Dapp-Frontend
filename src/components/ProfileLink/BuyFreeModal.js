import * as React from 'react' ;

import { connect } from 'react-redux';
import PropTypes from 'prop-types' ;
import {
    LoadingSellerProductsList, SellerAllProducts , 
    UserInfoById , UpdateSellerCustomer, SendAccessUrlByEmail
} from '../../redux/actions/link';

import { FreeOfferProduct } from '../../firebase/product_collection';

import { getCookie } from '../../utils/Helper';
import { CreateNotify } from '../../firebase/notify_collection';

import CloseIcon from '@mui/icons-material/Close';
import swal from 'sweetalert' ;
import { toast } from 'react-toastify/dist/react-toastify';

import  {
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    Box,
    Button,
    Grid,
} from '@mui/material' ;

import { useStyles } from './StylesDiv/BuyFree.styles';

const BuyFreeModal = (props) => {
    const classes = useStyles() ;

    const {
        open,
        handleClose,

        LoadingSellerProductsList,
        SellerAllProducts,
        productInfo
    } = props ;


    const handleFreeOffer = async () => {
        handleClose() ;
        if(await swal({
            title : "Confirm",
            text : "This product will be uploaded on your SOLSCloud",
            buttons: [
                'No, I am not sure!',
                'Yes, I am sure!'
            ],
            icon : 'info'
        })) {
            const id = toast.loading("[Free Offer] Tx is pending...");

            if( await FreeOfferProduct(productInfo?.id) ) {
                let buyerInfo = await UserInfoById(getCookie('_SOLSTICE_BUYER')) ;

                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name,
                    },
                    price : 0,
                    product : productInfo?.product_name,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : getCookie('_SOLSTICE_SELLER'),
                    type : 'free'
                }) ;

                await UpdateSellerCustomer(buyerInfo) ;
                await SendProductLink(productInfo.creator_id, buyer_id, productInfo.id) ;

                toast.update(id, { render: "[Free Offer] Tx is successful", type: "success", autoClose: 5000, isLoading: false });

                swal({
                    title : 'Please, Confirm your email box',
                    text : 'Access keys are sent to your email box.',
                    buttons: {
                        confirm : {text:'Got it'},
                    },
                    icon : 'success',
                    timer : 3000
                }) ;

            } else {
                toast.update(id, { render: "[Free Offer] Tx is failed" , type: "error", autoClose: 5000, isLoading: false });
            }
            
            await LoadingSellerProductsList(true);
            await SellerAllProducts() ;
            await LoadingSellerProductsList(false) ;
        }
    }

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
                        Product : { `[ ${productInfo?.product_name} ]` }
                    </Box>
                    <CloseIcon onClick={handleClose} sx={{cursor : 'pointer'}} className={classes.closeButtonCss} />
                </DialogTitle>
                <Box className={classes.dividerDiv} />
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{mb : '10px'}}>Release Date</Box>
                            <Box sx={{fontSize: '20px'}}>
                                {new Date(productInfo?.release_date).toLocaleDateString()}
                            </Box>
                        </Grid>
                        {
                            new Date().getTime() - new Date(productInfo?.release_date).getTime() < 0 && <Grid item xs={12}>
                                <Box sx={{color : '#13958f', fontSize : '15px'}}>
                                    This product is released at { new Date(productInfo?.release_date).toLocaleDateString() }
                                </Box>
                            </Grid>
                        }
                    </Grid>
                </DialogContent>
                <Box className={classes.dividerDiv} />
                <DialogActions>
                    <Button variant={'contained'} onClick={handleFreeOffer} 
                        disabled={
                            new Date().getTime() - new Date(productInfo?.release_date).getTime() < 0
                        }
                    >Free Offer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
BuyFreeModal.propTypes = {
    LoadingSellerProductsList : PropTypes.func.isRequired,
    SellerAllProducts : PropTypes.func.isRequired,
}
const mapStateToProps = state => ({
})
const mapDispatchToProps = {
    LoadingSellerProductsList,
    SellerAllProducts,
}
export default connect(mapStateToProps, mapDispatchToProps)(BuyFreeModal) ;