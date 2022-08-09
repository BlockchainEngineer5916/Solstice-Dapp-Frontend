import * as React from 'react' ;

import { useStripeInfo } from '../../contexts/StripeContext';
import { useWalletInfo } from '../../contexts/WalletContext';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { 
    SellerAllProducts, LoadingSellerProductsList, UpdateBundleBuyersMeta, 
    UserInfoById, UpdateSellerCustomer, SendAccessUrlByEmail,
} from '../../redux/actions/link';

import { SellerStripeInfo } from '../../firebase/user_collection';
import { CreatePayment } from '../../firebase/payment_collection';
import { CreateNotify } from '../../firebase/notify_collection';

import { createPaymentIntent } from '../../stripe/payment_api' ;
import { listAccount, deleteAccount, createAccountLink } from '../../stripe/account_api';

import { Payment } from '../../web3/market';

import { getUnit, getCookie, walletAddressFormat } from '../../utils/Helper';

import swal from 'sweetalert';
import CloseIcon from '@mui/icons-material/Close';

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

import { useStyles } from './StylesDiv/BuyBundle.styles';

const BuyBundleModal = (props) => {
    const classes = useStyles() ;
    
    const {
        open,
        handleClose,

        productInfo,
        SellerAllProducts,
        LoadingSellerProductsList,
    } = props ;

    const {
        isStripeConnected
    } = useStripeInfo() ;

    const {
        web3Provider,
        walletAddress,
        isWalletConnected
    } = useWalletInfo() ;

    const [paymentMethod, setPaymentMethod] = React.useState('stripe') ;

    const handleBuyProduct = async () => {
        if(await swal({
            title : "Confirm",
            text : "This product will be uploaded on your SOLSCloud",
            buttons: [
                'No, I am not sure!',
                'Yes, I am sure!'
            ],
            icon : 'info'
        })) {
            handleClose() ;

           if(paymentMethod === 'wallet') {
                await PayWithWallet() ;
           }
           if(paymentMethod === 'stripe') {
                await PayWithStripe() ;
           }
        }
    }

    const PayWithStripe = async () => {
        if(paymentMethod === 'stripe') {
            let sellerStripeInfo = await SellerStripeInfo(getCookie('_SOLSTICE_SELLER')) ;

            let data = {
                "amount" : Number(productInfo.bundle_price * 100).toFixed(0),
                "currency"  : 'usd',
                "automatic_payment_methods[enabled]" : 'true',
                "customer" : sellerStripeInfo.stripe_customer_id,
                "metadata[created_at]" : new Date().getTime() ,
                "metadata[creator_stripe_account_id]" : sellerStripeInfo.stripe_account_id,
                "metadata[creator_id]" :  productInfo.creator_id,
                "metadata[product_id]" : productInfo.id
            } ;
            
            let res = await createPaymentIntent(data) ;

            if(res) {
                await CreatePayment(
                    res.id,
                    res.client_secret,

                    productInfo.creator_id,
                    productInfo.creator_wallet,
                    sellerStripeInfo.full_name,
                    sellerStripeInfo.account_name,
                    sellerStripeInfo.profile_picture_url,
                    sellerStripeInfo.profile_link,
                    sellerStripeInfo.email,
                    sellerStripeInfo.stripe_account_id,

                    getCookie('_SOLSTICE_BUYER'),
                    null,
                    'normal',

                    productInfo.id,
                    productInfo.product_name,
                    `bundle`,
                    productInfo.bundle_price,
                    productInfo.bundle_unit,
                    null,
                    null,
                    null,

                    res.status
                ) ;

                window.open(location.origin + "/payment?payment_intent=" + res.id + "&payment_intent_client_secret=" + res.client_secret, '_self') ;
                
                return ;
            }

            swal({
                title : 'Failed',
                text : 'Your payment is failed',
                buttons: {
                    confirm : {text:'Got it'},
                },
                icon : 'error',
                timer : 3000
            }) ;
        }
    }

    const PayWithWallet = async () => {
        const id = toast.loading("[Buy Product] Tx is pending...");

        let txResult = await Payment(web3Provider, productInfo.creator_wallet, productInfo.bundle_price, productInfo.bundle_unit) ;

        let buyer_meta = productInfo.buyers_meta[getCookie('_SOLSTICE_BUYER')] ;

        if( txResult === 200 ) {
            let license_key = await  UpdateBundleBuyersMeta(buyer_meta, productInfo?.id) ;

            if(license_key) {

                let buyerInfo = await UserInfoById(getCookie('_SOLSTICE_BUYER')) ;

                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name 
                    },
                    price : productInfo?.bundle_price,
                    product : productInfo?.product_name,
                    unit : productInfo?.bundle_unit,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : getCookie('_SOLSTICE_SELLER'),
                    type : 'bundle'
                }) ;

                await UpdateSellerCustomer(buyerInfo) ;
                await SendAccessUrlByEmail(productInfo, license_key) ;

                toast.update(id, { render: "[Buy Product] Tx is successful", type: "success", autoClose: 5000, isLoading: false });

                swal({
                    title : 'Please, Confirm your email box',
                    text : 'Access and license keys are sent to your email box.',
                    buttons: {
                        confirm : {text:'Got it'},
                    },
                    icon : 'success',
                    timer : 3000
                }) ;
            } else {
                toast.update(id, { render: "[Buy Product] Tx is failed" , type: "error", autoClose: 5000, isLoading: false });
            }
        } else {
            toast.update(id, { render: txResult , type: "error", autoClose: 5000, isLoading: false });
        }

        await LoadingSellerProductsList(true) ;
        await SellerAllProducts() ;
        await LoadingSellerProductsList(false) ;
    }

    React.useEffect(() => {
        if(isWalletConnected) setPaymentMethod('wallet') ;
        if(isStripeConnected) setPaymentMethod('stripe');
        if(!isWalletConnected && !isStripeConnected) handleClose() ;

    }, [isWalletConnected, isStripeConnected]) ;

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
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Price Per Subscription</Box>
                            <Box sx={{fontSize: '20px'}}>
                                { productInfo?.bundle_price } {getUnit(productInfo?.bundle_unit)}
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Payment</Box>
                            <Box sx={{fontSize: '20px'}}>
                                Monthly
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Distribution Schedule</Box>
                            <Box sx={{fontSize: '20px'}}>
                                Weekly
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Release Date</Box>
                            <Box sx={{fontSize: '20px'}}>
                                { new Date(productInfo.release_date).toLocaleDateString() }
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{mb : '10px'}}>Select Payment Method</Box>
                            {
                                isStripeConnected && <Box className={classes.paymentDiv} sx={{background : paymentMethod === 'stripe' && '#263844'}} onClick={() => setPaymentMethod('stripe')}>
                                    <Box className={classes.tickDiv} sx={{background : paymentMethod === 'stripe' && '#00ff5a'}}/>
                                    <Box>Pay With Stripe</Box>
                                </Box>
                            }
                            {
                                isWalletConnected && <Box className={classes.paymentDiv} sx={{background : paymentMethod === 'wallet' && '#263844'}} onClick={() => setPaymentMethod('wallet')}>
                                    <Box className={classes.tickDiv} sx={{background : paymentMethod === 'wallet' && '#00ff5a'}}/>
                                    <Box>Pay With Wallet</Box>
                                </Box>
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
                <Box className={classes.dividerDiv} />
                <DialogActions>
                    <Button variant={'contained'} onClick={handleBuyProduct} 
                        disabled={ new Date().getTime() - new Date(productInfo?.release_date).getTime() < 0 }
                    >
                        Payment 
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
BuyBundleModal.propTypes = {
    LoadingSellerProductsList : PropTypes.func.isRequired,
    SellerAllProducts : PropTypes.func.isRequired,
}
const mapStateToProps = state => ({
})
const mapDispatchToProps = {
    LoadingSellerProductsList,
    SellerAllProducts,
}
export default connect(mapStateToProps, mapDispatchToProps)(BuyBundleModal) ;