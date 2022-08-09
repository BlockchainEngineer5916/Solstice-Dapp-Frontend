import React, { useEffect, useState } from 'react' ;

import { useLocation } from 'react-use';

import { useWalletInfo } from '../../contexts/WalletContext';
import { useStripeInfo } from '../../contexts/StripeContext';

import { connect } from 'react-redux';
import PropTypes from 'prop-types' ;
import { 
    LoadingSellerProductsList, SellerAllProducts, 
    SellerProfileInfo, 
    UpdateSellerCustomer,
    SendAccessUrlByEmail
} from '../../redux/actions/link';

import { SellerStripeInfo, UpdateResellerCount , UserInfoById} from '../../firebase/user_collection';
import { CreatePayment } from '../../firebase/payment_collection';
import { CreateNotify } from '../../firebase/notify_collection';
import { UpdateLegenOwners, UpdateLegenBuyers } from '../../firebase/product_collection';

import { NFTBalance } from '../../web3/fetch';
import { Payment, SellNFT } from '../../web3/market';
import { createPaymentIntent } from '../../stripe/payment_api' ;

import md5 from 'md5';

import { getUnit,getCookie } from '../../utils/Helper';
import CloseIcon from '@mui/icons-material/Close';
import swal from 'sweetalert';

import { toast } from 'react-toastify/dist/react-toastify';

import  {
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    Box,
    Button,
    Grid,
    Select,
    MenuItem,
    FormControl
} from '@mui/material' ;

import { useStyles } from './StylesDiv/BuyLegendary.styles';

import { useTheme } from '@mui/styles';

const BuyLegendaryModal = (props) => {

    const classes = useStyles() ;
    const theme = useTheme() ;

    const {
        open,
        handleClose,

        productInfo,

        SellerProfileInfo,
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


    const location = useLocation() ;

    const [role, setRole] = useState(null) ;
    const [paymentMethod, setPaymentMethod] = useState('stripe') ;
    const [balanceOf, setBalanceOf] = useState(0) ;

    const handleBuyProduct = async (resell) => {
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
                await PayWithWallet(resell) ;
           }
           if(paymentMethod === 'stripe') {
                await PayWithStripe(resell) ;
           }
        }
    }

    const PayWithStripe = async (resell) => {
        let sellerStripeInfo = await SellerStripeInfo(getCookie('_SOLSTICE_SELLER')) ;

        console.log(sellerStripeInfo) ;

        let price ;
        
        if(resell) price = Number( productInfo.ticket_price * 100).toFixed(0) ;
        else price = Number( productInfo.product_price * 100).toFixed(0) ;

        let data = {
            "amount" : price,
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
                walletAddress,
                resell ? 'reseller' : 'normal',

                productInfo.id,
                productInfo.product_name,
                `legendary`,
                resell ? productInfo.ticket_price : productInfo.product_price ,
                resell ? productInfo.ticket_unit : productInfo.product_unit,
                null,
                null,
                productInfo.nft_id,

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

    const PayWithWallet = async (resell) => {
        let id ;

        if(resell) id = toast.loading("[Buy Legendary(NFT)] Tx is pending...");
        else  id = toast.loading("[Buy Legendary(Product)] Tx is pending...")

        let txPayment = await Payment(
            web3Provider, productInfo.creator_wallet, 
            resell ? productInfo.ticket_price : productInfo.product_price, 
            resell ? productInfo.ticket_unit : productInfo.product_unit
        ) ;

        if( txPayment === 200 ) {
            if(resell) {
                let txSellNFT = await SellNFT(walletAddress, md5(getCookie('_SOLSTICE_BUYER')), Number(productInfo.nft_id), 1) ;

                if( txSellNFT !== 200 ) {
                    toast.update(id, { render: "[Buy Legendary(NFT)] Tx is failed", type: "error", autoClose: 5000, isLoading: false });

                    return ;
                }
                
                let buyerInfo = await UserInfoById(getCookie('_SOLSTICE_BUYER')) ;

                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name ,
                        role : "reseller"
                    },
                    price : productInfo?.ticket_price,
                    product : productInfo?.product_name,
                    unit : productInfo?.ticket_unit,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : getCookie('_SOLSTICE_SELLER'),
                    type : 'legendary'
                }) ;

                await UpdateSellerCustomer(buyerInfo) ;

                await UpdateResellerCount(getCookie('_SOLSTICE_SELLER')) ;
                await SellerProfileInfo(location.href);

                await UpdateLegenOwners(productInfo?.id, getCookie('_SOLSTICE_BUYER'), walletAddress) ;

                await SendAccessUrlByEmail(productInfo) ;

                toast.update(id, { render: '[Buy Legendary(NFT)] Tx is successful' , type: "success", autoClose: 5000, isLoading: false });
            } else {
                let buyerInfo = await UserInfoById(getCookie('_SOLSTICE_BUYER')) ;

                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name ,
                        role : "buyer"
                    },
                    price : productInfo?.product_price,
                    product : productInfo?.product_name,
                    unit : productInfo?.product_unit,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : getCookie('_SOLSTICE_SELLER'),
                    type : 'legendary'
                }) ;

                await UpdateSellerCustomer(buyerInfo) ;
                await UpdateLegenBuyers(productInfo.id, getCookie('_SOLSTICE_BUYER'), walletAddress) ;

                await SendAccessUrlByEmail(productInfo) ;

                toast.update(id, { render: '[Buy Legendary(Product)] Tx is successful' , type: "success", autoClose: 5000, isLoading: false });
            }

            await LoadingSellerProductsList(true) ;
            await SellerAllProducts() ;
            await LoadingSellerProductsList(false) ;
        } else {
            if(resell) toast.update(id, { render: "[Buy Legendary(NFT)] Tx is failed" , type: "error", autoClose: 5000, isLoading: false });
            else  toast.update(id, { render: "[Buy Legendary(Product)] Tx is failed" , type: "error", autoClose: 5000, isLoading: false });
        }
    }

    useEffect(async () => { 
        if(productInfo) {
            if(productInfo.resellable && productInfo.owners_ids.includes(getCookie('_SOLSTICE_SELLER'))) setRole('buyer') ;
            if(productInfo.resellable && productInfo.creator_id === getCookie('_SOLSTICE_SELLER')) setRole('reseller') ;
            if(!productInfo.resellable) setRole('buyer') ;
        }
    }, [productInfo]) ;

    useEffect(async () => {
        if(web3Provider) {
            let balanceOf = await NFTBalance(Number(productInfo.nft_id), productInfo.creator_wallet) ;
            
            if(Number(balanceOf) - 1 === 0) setRole('buyer') ;
            setBalanceOf(Number(balanceOf) - 1) ;
        }
    }, [web3Provider]) ;

    useEffect(() => {
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
                        Legendary : { ` ${productInfo?.product_name} ` }
                    </Box>
                    <CloseIcon onClick={handleClose} sx={{cursor : 'pointer'}} className={classes.closeButtonCss} />
                </DialogTitle>
                <Box className={classes.dividerDiv} />
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Price per product</Box>
                            <Box sx={{fontSize: '20px'}}>
                                {productInfo?.product_price} { getUnit(productInfo?.product_unit) }
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{mb : '10px'}}>Royalty</Box>
                            <Box sx={{fontSize: '20px'}}>
                                {productInfo?.royalty} %
                            </Box>
                        </Grid>
                        {
                            productInfo?.resellable ? <>
                                <Grid item xs={6}>
                                    <Box sx={{mb : '10px'}}>Price per ticket</Box>
                                    <Box sx={{fontSize: '20px'}}>
                                        {productInfo?.ticket_price} { getUnit(productInfo?.ticket_unit) }
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{mb : '10px'}}># of tickets available</Box>
                                    <Box sx={{fontSize: '20px'}}>
                                        { productInfo?.ticket_count }
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{mb : '10px'}}>Status</Box>
                                    <Box sx={{fontSize: '15px'}}>
                                        balance Of creator : { balanceOf }<br/>
                                        # of sold nft : { productInfo?.ticket_count - balanceOf }
                                    </Box>
                                </Grid>
                            </> : <></>
                        }
                        {
                            role && <Grid item xs={6}>
                                <Box sx={{mb : '10px'}}>Select Role</Box>
                                <FormControl
                                    fullWidth
                                >
                                    <Select
                                        value={role}
                                        MenuProps={{
                                            className : classes.selectDiv
                                        }}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        {
                                            !productInfo.buyers_ids.includes(getCookie('_SOLSTICE_BUYER')) 
                                            && <MenuItem value={'buyer'}>Buyer</MenuItem>
                                        }
                                        {
                                            productInfo.resellable && productInfo.creator_id === getCookie('_SOLSTICE_SELLER') &&
                                            !productInfo.owners_ids.includes(getCookie('_SOLSTICE_BUYER')) && balanceOf
                                            && <MenuItem value={'reseller'}>Reseller</MenuItem>
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                        }
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
                <Box className={classes.dividerDiv}/>
                <DialogActions>
                    {
                        role === 'reseller' ? <Button variant='contained'  onClick={() => handleBuyProduct(true)} disabled={!balanceOf}>Buy NFT</Button>
                        : <Button variant='contained' onClick={() => handleBuyProduct(false)}>Buy Product</Button>
                    }
                </DialogActions>
            </Dialog>
        </Box>
    )
}
BuyLegendaryModal.propTypes = {
    SellerProfileInfo : PropTypes.func.isRequired,
    LoadingSellerProductsList : PropTypes.func.isRequired,
    SellerAllProducts : PropTypes.func.isRequired,
}
const mapStateToProps = state => ({
})
const mapDispatchToProps = {
    SellerProfileInfo,
    LoadingSellerProductsList,
    SellerAllProducts 
}
export default connect(mapStateToProps, mapDispatchToProps)(BuyLegendaryModal) ;