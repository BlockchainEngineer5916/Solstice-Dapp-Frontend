import * as React from 'react' ;

import { useLocation } from 'react-use';

import {connect} from 'react-redux' ;
import PropTypes from 'prop-types' ;
import { SignInUserWithEmailAndPassword } from '../../redux/actions/auth';

import { useWalletInfo } from '../../contexts/WalletContext';

import { 
    UserInfoByEmail, CreateUserWithoutPassword,
    SellerStripeInfo,
    UserInfoById, UpdateSellerCustomer
} from '../../firebase/user_collection';

import { CheckBuyerOrOwner, FreeOfferProduct } from '../../firebase/product_collection';
import { CreateNotify } from '../../firebase/notify_collection';
import { CreatePayment } from '../../firebase/payment_collection';
import { PlaceBid } from '../../firebase/bid_collection';

import { SendProductLink } from '../../email';
import { createPaymentIntent } from '../../stripe/payment_api';

import { NFTBalance } from '../../web3/fetch';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { setCookie } from '../../utils/Helper';
import validator from 'validator';

import SuccessImage from '../../assets/confirm/Success.svg' ;

import { toast } from 'react-toastify/dist/react-toastify';

import {
    Box,
    TextField,
    Grid,
    InputAdornment,
    Button,
    FormControl,
    Select,
    MenuItem,
    Tooltip
} from '@mui/material' ;

import { useStyles } from './StylesDiv/BuyerInfo.styles';
import { useTheme } from '@mui/styles' ;

const BuyerInfo = (props) => {
    const classes = useStyles() ;
    const theme = useTheme() ;
    const location = useLocation() ;

    const {
        productInfo,
        setClientSecret,

        SignInUserWithEmailAndPassword
    } = props ;

    const {
        walletAddress,
        isWalletConnected
    } = useWalletInfo() ;

    const [businessName, setBusinessName] = React.useState('') ;
    const [email, setEmail] = React.useState('') ;
    const [password,  setPassword] = React.useState('') ;
    const [fullName, setFullName] = React.useState('') ;
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const [isValidUser, setIsValidUser] = React.useState(false) ;
    const [bidPrice, setBidPrice] = React.useState(0) ;
    const [bidAmount, setBidAmount] = React.useState(0) ;
    const [balanceOf, setBalanceOf] = React.useState(0) ;
    const [resellable, setResellable] = React.useState(false) ;
    const [purchaseType, setPurchaseType] = React.useState('general') ;
    const [userRole, setUserRole] = React.useState(false) ;

    const handleBidAmount = (value) => {
        setBidAmount(Number(Number(value).toFixed(0))) ;
    }

    const handlePlaceBid = async  () => {
        if(!walletAddress) {
            return swal({
                title : 'Warning',
                text : "Please, connect your wallet",
                buttons: false,
                timer : 3000,
                icon : 'warning'
            })
        }
        if(Number(productInfo?.minimum_bidding) > bidPrice) {
            return swal({
                title : 'Warning',
                text : "Bid price is too low",
                buttons: false,
                timer : 3000,
                icon : 'warning'
            })
        }
        if(Number(balanceOf < bidAmount)) {
            return swal({
                title : 'Warning',
                text : "Overflow Bid Amount",
                buttons: false,
                timer : 3000,
                icon : 'warning'
            })
        }
        if( await swal({
            title : 'Confirm',
            text : "Are you sure that you place bid?",
            buttons: [
                'No, I am not sure!',
                'Yes, I am sure!'
            ],
            icon : 'info'
        })) {
            let buyerInfo = await UserInfoByEmail(email) ;
            let creatorInfo = await UserInfoById(productInfo.creator_id) ;

            const id = toast.loading("[Place Bid] Tx is pending...");

            let txPlaceBid = await PlaceBid(
                productInfo.creator_id,
                productInfo.creator_wallet,
                creatorInfo.profile_picture_url,
                buyerInfo.id,
                walletAddress,
                productInfo.id,
                productInfo.product_name,
                productInfo.product_type,
                productInfo.product_description,
                productInfo.nft_id,
                'rare',
                productInfo.minimum_bidding,
                bidAmount,
                bidPrice,
                productInfo.bid_unit,
            ) ;

            if(txPlaceBid) {
                toast.update(id, { render: "[Place Bid] Tx is successful", type: "success", autoClose: 5000, isLoading: false });
                
                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name 
                    },
                    price : bidPrice,
                    amount : bidAmount,
                    product : productInfo?.product_name,
                    unit : productInfo?.bid_unit,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : productInfo?.creator_id,
                    type : 'rare'
                }) ;

                if(await swal({
                    title : 'Confirm',
                    text : "You can confirm your bid in Cart page",
                    buttons: {
                        confirm : {text  : 'Got it'}
                    },
                    icon : 'info'
                })) {
                    setCookie('_SOLSTICE_AUTHUSER', buyerInfo.id) ;
                    setCookie('_USER_TYPE', 'internal') ;
                    
                    window.open(location.origin + "/solstice/cart-screen", '_self') ;
                }
            }
            else {
                toast.update(id, { render:'[Place Bid] Tx is failed' , type: "error", autoClose: 5000, isLoading: false });
            }
        }
    }

    const handleBuyProduct = async () => {
        let buyerInfo = await UserInfoByEmail(email) ;

        if(!buyerInfo) {
            buyerInfo = await CreateUserWithoutPassword(fullName, businessName, email) ;
        } else {
            let role = await CheckBuyerOrOwner(productInfo.id, buyerInfo.id, productInfo.price_type) ;

            setUserRole(role) ;

            if(role) {
                return ;
            }
        }

        setCookie('_SOLSTICE_AUTHUSER', buyerInfo.id) ;
        setCookie('_USER_TYPE', buyerInfo.user_type) ;

        if(productInfo.price_type === 'bundle') {
            await payAboutBundle(buyerInfo.id) ;
        }
        if(productInfo.price_type === 'legendary') {
            await payAboutLegen(false, buyerInfo.id) ;
        }
        if(productInfo.price_type === 'free') {
            await getOnFree(buyerInfo.id) ;
        }
    }

    const handleBuyNFT = async () => {
        if(!isWalletConnected) {
            swal({
                title : 'Please, connect your wallet',
                text : 'In order to purchase this product as NFT, you should connect to wallet.',
                icon : 'info',
                buttons : false,
                timer : 5000
            }) ;
            return ;
        }

        let res = await SignInUserWithEmailAndPassword(email, password) ;

        if( res === 200) {
            if(
                await swal({
                    title: 'Sign in successfully!',
                    text: productInfo.price_type === 'rare' ? 'You can bid on this product' : 'You can get this product as NFT',
                    buttons: {
                        confirm : {text:'Got it'},
                    },
                    icon : 'success'
                })
            ) {
                setIsValidUser(true) ;

                let buyerInfo = await UserInfoByEmail(email) ;
                let role = await CheckBuyerOrOwner(productInfo.id, buyerInfo.id, productInfo.price_type) ;

                setUserRole(role) ;
    
                if(role === 'owner') {
                    return ;
                }

                if(productInfo.price_type === 'rare') {
                    setBidAmount(balanceOf);
                    setBidPrice(productInfo?.minimum_bidding) ;
                }
                if(productInfo.price_type === 'legendary') {
                    await payAboutLegen(true, buyerInfo.id ) ;
                }
            }
        } else if( res === 401 ) {
            swal({
                title: 'Please Make sure you enter correct credentials',
                text: 'An email will be sent shortly from admin@solsapp.com',
                buttons: {
                    confirm : {text:'Got it'},
                },
                icon : 'error'
            })
        }  else {
            swal({
                title: 'Please Check your mailbox to confirm your email',
                text: 'If you don’t recieve the message within 2min please check your spam folder',
                buttons: {
                    confirm : {text:'Got it'},
                },
                icon : 'info'
            })
        }
    }

    const payAboutBundle = async (buyerId) => {
        let sellerStripeInfo = await SellerStripeInfo(productInfo.creator.id) ;

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

                buyerId,
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

            setClientSecret(res.client_secret) ;
            
            return ;
        }
    }

    const getOnFree = async (buyerId) => {
        if(await swal({
            title : "Confirm",
            text : "This product will be uploaded on your SOLSCloud",
            buttons: [
                'No, I am not sure!',
                'Yes, I am sure!'
            ],
            icon : 'info'
        })) {
            const id = toast.loading("pending...");

            if( await FreeOfferProduct(productInfo.id, buyerId)) {
                let buyerInfo = await UserInfoById(buyerId) ;

                await CreateNotify({
                    buyer : {
                        email : buyerInfo.email,
                        profile_link : buyerInfo.profile_link,
                        account_name : buyerInfo.account_name,
                    },
                    price : 0,
                    product : productInfo.product_name,
                    purchased_at : new Date().toLocaleDateString(),
                    seller : productInfo.creator_id,
                    type : 'free'
                }) ;

                await UpdateSellerCustomer(productInfo.creator_id, buyerId) ;
                await SendProductLink(productInfo.creator_id, buyerId, productInfo.id) ;

                toast.update(id, { render: "Success", type: "success", autoClose: 5000, isLoading: false });

                swal({
                    title : 'Please, Confirm your email box',
                    text : 'Product URL is sent to your email box.',
                    buttons: {
                        confirm : {text:'Got it'},
                    },
                    icon : 'success',
                    timer : 4000
                }) ;

            } else {
                toast.update(id, { render: "failed" , type: "error", autoClose: 5000, isLoading: false });
            }
        }
    }

    const payAboutLegen = async (resell, buyer_id) => {
        let sellerStripeInfo = await SellerStripeInfo(productInfo.creator_id) ;

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

                buyer_id,
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

            setClientSecret(res.client_secret) ;
            
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

    React.useEffect(async () => {
        if(productInfo?.price_type === 'rare') {
            console.log(productInfo);
            let balanceOf = await NFTBalance( productInfo.nft_id, productInfo.creator_wallet) ;
            setBalanceOf(balanceOf) ;
        }
    }, [productInfo]) ;

    return (
        <Box className={classes.root}>
            <Box className={classes.infoDiv}>
                {
                    !userRole ? <>
                        {
                            productInfo?.price_type === 'legendary' && <>
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv}>
                                        Purchase Type
                                    </Box>
                                    <FormControl
                                            fullWidth
                                        >
                                        <Select
                                            value={purchaseType}
                                            MenuProps={{
                                                className : classes.selectDiv
                                            }}
                                            onChange={(e) =>  setPurchaseType(e.target.value)}
                                        >
                                            {
                                                <MenuItem value={'general'}>General</MenuItem>
                                            }
                                            {
                                                productInfo?.resellable && <MenuItem value={'nft'}>NFT</MenuItem>
                                            }
                                        </Select>
                                    </FormControl>
                                    {
                                        purchaseType === 'general' ? <>
                                            <Box className={classes.ctrlGroup} sx={{mt : '10px'}}>
                                                <Box className={classes.labelDiv}>
                                                    Full Name
                                                </Box>
                                                <TextField 
                                                    name={'fullName'}
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    fullWidth
                                                />
                                            </Box>
                                            <Box className={classes.ctrlGroup}>
                                                <Box className={classes.labelDiv}>
                                                    Business Name
                                                </Box>
                                                <TextField 
                                                    name={'businessName'}
                                                    value={businessName}
                                                    onChange={(e) => setBusinessName(e.target.value)}
                                                    fullWidth
                                                />
                                            </Box>
                                            <Box className={classes.ctrlGroup}>
                                                <Box className={classes.labelDiv} sx={{fontSize : '15px', color  : theme.palette.blue.B100}}>
                                                    What should we call you?
                                                </Box>
                                            </Box>
                                            <Box className={classes.ctrlGroup}>
                                                <Box className={classes.labelDiv}>
                                                    Email
                                                </Box>
                                                <TextField 
                                                    name={'email'}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    helperText={(validator.isEmail(email) || email === '') ? "" : "Invalid Email"}
                                                    fullWidth
                                                />
                                            </Box>
                                            <Box className={classes.ctrlGroup} sx={{ display :'flex', justifyContent : 'flex-end', mt : '20px'}}>
                                                <Button variant={'contained'} onClick={() => handleBuyProduct()} className={classes.buttonCss1}>
                                                    Buy with Stripe
                                                </Button>
                                            </Box>
                                        </> 
                                        : <>
                                            <Box className={classes.ctrlGroup} sx={{mt : '10px'}}>
                                                <Box className={classes.labelDiv}>
                                                    Email
                                                </Box>
                                                <TextField 
                                                    name={'email'}
                                                    placeholder='Enter your email'
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    helperText={(validator.isEmail(email) || email === '') ? "" : "Invalid Email"}
                                                    fullWidth
                                                />
                                            </Box>
                                            <Box className={classes.ctrlGroup}>
                                                <Box className={classes.labelDiv}>
                                                    Password
                                                </Box>
                                                <TextField
                                                    placeholder='Enter your password'
                                                    type={!passwordVisible ? 'password' : 'text'}
                                                    size='medium'
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end" sx={{cursor : 'pointer'}} onClick={() => setPasswordVisible(!passwordVisible)}>
                                                        {
                                                            !passwordVisible ? <VisibilityIcon/> : <VisibilityOffIcon/>
                                                        }
                                                    </InputAdornment>,
                                                    }}

                                                    helperText={password === '' ? 'Please, Input Your Password' : null}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    value={password}
                                                />
                                            </Box>
                                            <Box className={classes.ctrlGroup}>
                                                <Box className={classes.labelDiv} sx={{fontSize : '13px', color  : theme.palette.blue.B100}}>
                                                    In order to purchaset this product as NFT, you should use your SOLSTICE account email and password.
                                                </Box>
                                            </Box>
                                            <Box className={classes.ctrlGroup}>
                                                <Box className={classes.labelDiv} sx={{fontSize : '12px', color  : theme.palette.green.G100}}>
                                                    Don't you have SOLSTICE account? <a href='auth/' target={'_blank'}>Sign Up</a>
                                                </Box>
                                            </Box>
                                            <Box className={classes.ctrlGroup} sx={{ display :'flex', justifyContent : 'flex-end', mt : '20px'}}>
                                                <Button variant={'contained'} onClick={() => handleBuyNFT()} className={classes.buttonCss1}>
                                                    Buy NFT
                                                </Button>
                                            </Box>
                                        </>
                                    }
                                </Box>
                                
                            </>
                        }
                        {
                            productInfo?.price_type === 'bundle' && <> 
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv}>
                                        Full Name
                                    </Box>
                                    <TextField 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv}>
                                        Business Name
                                    </Box>
                                    <TextField 
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv} sx={{fontSize : '15px', color  : theme.palette.blue.B100}}>
                                        What should we call you?
                                    </Box>
                                </Box>
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv}>
                                        Email
                                    </Box>
                                    <TextField 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        helperText={(validator.isEmail(email) || email === '') ? "" : "Invalid Email"}
                                        fullWidth
                                    />
                                </Box>
                                <Box className={classes.ctrlGroup} sx={{ display :'flex', justifyContent : 'flex-end', mt : '20px'}}>
                                    <Button variant={'contained'} onClick={() => handleBuyProduct()} className={classes.buttonCss1}>
                                        Buy with Stripe
                                    </Button>
                                </Box>
                            </>
                        }
                        {
                            productInfo?.price_type === 'free' && <> 
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv}>
                                        Full Name
                                    </Box>
                                    <TextField 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv}>
                                        Business Name
                                    </Box>
                                    <TextField 
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        fullWidth
                                    />
                                </Box>
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv} sx={{fontSize : '15px', color  : theme.palette.blue.B100}}>
                                        What should we call you?
                                    </Box>
                                </Box>
                                <Box className={classes.ctrlGroup}>
                                    <Box className={classes.labelDiv}>
                                        Email
                                    </Box>
                                    <TextField 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        helperText={(validator.isEmail(email) || email === '') ? "" : "Invalid Email"}
                                        fullWidth
                                    />
                                </Box>
                                <Box className={classes.ctrlGroup} sx={{ display :'flex', justifyContent : 'flex-end', mt : '20px'}}>
                                    <Button variant={'contained'} onClick={() => handleBuyProduct()} className={classes.buttonCss1}>
                                        Get On Free
                                    </Button>
                                </Box>
                            </>
                        }
                        {
                            productInfo?.price_type === 'rare' && (
                                isValidUser ? <>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.labelDiv}>
                                            Wallet Address
                                        </Box>
                                        <Box className={classes.valueDiv}>
                                            { walletAddress || 'Lock' }
                                        </Box>
                                    </Box>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.labelDiv}>
                                            Bid Price
                                        </Box>
                                        <TextField
                                            type={'number'}
                                            min={productInfo?.minimum_bidding || 0}
                                            value={bidPrice}
                                            onChange={(e) => setBidPrice(e.target.value)}
                                            fullWidth
                                        />
                                    </Box>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.labelDiv}>
                                            Bid Amount
                                        </Box>
                                        <TextField 
                                            type={'number'}
                                            min={productInfo?.available_items || 0}
                                            value={bidAmount}
                                            onChange={(e) => handleBidAmount(e.target.value)}
                                            fullWidth
                                        />
                                    </Box>
                                    <Box className={classes.ctrlGroup} sx={{ display :'flex', justifyContent : 'flex-end', mt : '20px'}}>
                                        <Button variant={'contained'} onClick={() => handlePlaceBid()} className={classes.buttonCss1}>
                                            Place Bid
                                        </Button>
                                    </Box>
                                </>: <>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.labelDiv}>
                                            Email
                                        </Box>
                                        <TextField 
                                            placeholder='Enter your email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            helperText={(validator.isEmail(email) || email === '') ? "" : "Invalid Email"}
                                            fullWidth
                                        />
                                    </Box>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.labelDiv}>
                                            Password
                                        </Box>
                                        <TextField
                                            placeholder='Enter your password'
                                            type={!passwordVisible ? 'password' : 'text'}
                                            size='medium'
                                            fullWidth
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end" sx={{cursor : 'pointer'}} onClick={() => setPasswordVisible(!passwordVisible)}>
                                                {
                                                    !passwordVisible ? <VisibilityIcon/> : <VisibilityOffIcon/>
                                                }
                                            </InputAdornment>,
                                            }}

                                            helperText={password === '' ? 'Please, Input Your Password' : null}
                                            onChange={(e) => setPassword(e.target.value)}
                                            value={password}
                                        />
                                    </Box>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.labelDiv} sx={{fontSize : '12px', color  : theme.palette.green.G100}}>
                                            Don't you have SOLSTICE account? <a href='auth/' target={'_blank'}>Sign Up</a>
                                        </Box>
                                    </Box>
                                    <Box className={classes.ctrlGroup} sx={{ display :'flex', justifyContent : 'flex-end', mt : '20px'}}>
                                        <Button variant={'contained'} onClick={() => handleBuyNFT()} className={classes.buttonCss1}>
                                            Sign In
                                        </Button>
                                    </Box>
                                </>
                            )
                        }
                    
                    </> : <>
                        <img src={SuccessImage} className={classes.iconCss} />
                        <>
                            {
                                userRole === 'owner' ? <>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.descriptionDiv} >
                                            You are owner of this NFT.
                                        </Box>
                                        <Box className={classes.descriptionDiv} sx={{mt : '20px',}}>
                                            Product Link
                                        </Box>
                                        <Tooltip title={ location.origin + '/product-link?access_key=' + productInfo.access_key }>
                                            <Box className={classes.descriptionDiv}>
                                                <a href={location.origin + '/product-link?access_key=' + productInfo.access_key}>
                                                    { new String(location.origin + '/product-link?access_key=' + productInfo.access_key).slice(0 , 30) }...
                                                </a>
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                </> : <>
                                    <Box className={classes.ctrlGroup}>
                                        <Box className={classes.descriptionDiv} >
                                            You had already bought this product.
                                        </Box>
                                        <Box className={classes.descriptionDiv} sx={{mt : '20px',}}>
                                            Product Link
                                        </Box>
                                        <Tooltip title={ location.origin + '/product-link?access_key=' + productInfo.access_key }>
                                            <Box className={classes.descriptionDiv}>
                                                <a href={location.origin + '/product-link?access_key=' + productInfo.access_key}>
                                                    { new String(location.origin + '/product-link?access_key=' + productInfo.access_key).slice(0 , 30) }...
                                                </a>
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                    {
                                        productInfo.price_type === 'legendary' && <Box className={classes.ctrlGroup} sx={{ display :'flex', justifyContent : 'flex-end', mt : '20px'}}>
                                            <Button variant='contained' className={classes.buttonCss1} onClick={() => {
                                                setUserRole(false) ;
                                                setPurchaseType('nft') ;
                                            }}>
                                                Got it
                                            </Button>
                                        </Box>
                                    }
                                </>
                            }
                        </>
                    </>
                }
            
            </Box>
        </Box>
    )
}
BuyerInfo.propTypes= {
    SignInUserWithEmailAndPassword : PropTypes.func.isRequired
}
const mapStateToProps = state => ({

})
const mapDispatchToProps = {
    SignInUserWithEmailAndPassword
}

export default connect(mapStateToProps, mapDispatchToProps) (BuyerInfo) ;