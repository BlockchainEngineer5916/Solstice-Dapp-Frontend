import * as React from 'react' ;

import { useStripeInfo } from '../../../contexts/StripeContext';

import { useLocation } from 'react-use';

import {connect} from 'react-redux' ;
import PropTypes from 'prop-types' ;
import { CreateStripeAccount, ExpandedItem, DeleteUserStripeAccountId, CompleteStripeAccount } from '../../../redux/actions/setting';
import { ConnectAppToStripe } from '../../../redux/actions/stripe';
import { UserAccountInfo } from '../../../redux/actions/profile' ;

import { getCookie } from '../../../utils/Helper';
import swal from 'sweetalert' ;
import clsx from 'clsx' ;

import ExpandMoreIcon from '@mui/icons-material/ExpandMore' ;

import {
    Box ,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button
} from '@mui/material' ;

import { useStyles } from './StylesDiv/Payment.styles';
import { useTheme } from '@mui/material' ;
import { deleteAccount, retrieveAccount } from '../../../stripe/account_api';
import { createTransfer } from '../../../stripe/transfer_api' ; 

const ConfigurePayment = (props) => {
    const classes = useStyles() ;
    const theme = useTheme() ;
    const location = useLocation() ;
    
    const {
        ExpandedItem,
        ConnectAppToStripe,
        UserAccountInfo,
        expandedItem,
        profileLink,
        accountName,
        email,
        phoneNumber,
        stripe_account_id,
        stripe_customer_id,
        stripe_account_create_confirm_code
    } = props ;

    const {
        isStripeConnected
    } = useStripeInfo() ;

    const [expand, setExpand] = React.useState(false) ;
    const [loading,setLoading] = React.useState(true) ;

    const TriggerExpandedItem = (e, expanded, itemIndex) => {
        ExpandedItem(itemIndex) ;
        setExpand(expanded) ;
    }
    
    const handleConnectToStripe = async () => {
        setLoading(true) ;
        
        let stripeAccount = await retrieveAccount(stripe_account_id) ;

        if(!stripeAccount) {
            swal({
                title : "Warning",
                text : "Your account is deleted",
                icon : "warning",
                buttons : false,
                timer : 5000,
            }) ;

            await DeleteUserStripeAccountId() ;

            await UserAccountInfo(getCookie('_SOLSTICE_AUTHUSER')) ;

            setLoading(false) ;

            return ;
        }        

        console.log(stripeAccount.capabilities.transfers) ;

        if(stripeAccount.capabilities.transfers === 'pending') {
            await swal({
                title : "Your account is pending...",
                text : "Please, wait for a while",
                icon : "info",
                buttons: false,
                timer : 5000
            })

            setLoading(false) ;

            return ;
        }

        if(stripeAccount.capabilities.transfers !== 'active') {
            if( await swal({
                    title : "Your stripe account transfer is inactive!",
                    text : "If you want to activate transfer, you should complete your stripe account info(for example : SSN ...)",
                    icon : "info",
                    buttons: {
                        confirm : {text : 'Got it'}
                    },
                })
            ) {
                window.open('https://dashboard.stripe.com/login', '_blank') ;
            }

            setLoading(false) ;

            return ;
        }

        await ConnectAppToStripe() ;
        setLoading(false) ;
    }

    const handleCreateStripeAccount = async () => {
        setLoading(true) ;

        let req_create_account = {
            "type" : "standard" ,
            // "email" : email,
            "default_currency" : "usd",
            "business_profile[url]" : profileLink,
            "business_profile[name]" : accountName,
            "business_type" : 'individual',
            // 'individual[email]' : email,
            "individual[phone]" : phoneNumber,
            "metadata[user_id]" : getCookie('_SOLSTICE_AUTHUSER')
        } ;

        let api_result = await CreateStripeAccount(req_create_account) ;

        if(api_result == 'create_account_error') {
            swal({
                title : 'Error',
                text : "Account Creation Failed",
                buttons : false,
                timer : 5000,
                icon : 'error'
            }) ;
        }

        if(api_result === 'create_account_link_error')  {
            swal({
                title : 'Error',
                text : "Account Creation Failed",
                buttons : false,
                timer : 5000,
                icon : 'error'
            }) ;
        }

        setLoading(false) ;
    }

    const handleCompleteStripeAccount = async () => {
        setLoading(true) ;

        let api_result = await CompleteStripeAccount(stripe_account_id) ;

        if(api_result == 'create_account_error') {
            swal({
                title : 'Error',
                text : "Account Creation Failed",
                buttons : false,
                timer : 5000,
                icon : 'error'
            }) ;
        }

        if(api_result === 'create_account_link_error')  {
            swal({
                title : 'Error',
                text : "Account Creation Failed",
                buttons : false,
                timer : 5000,
                icon : 'error'
            }) ;
        }

        setLoading(false) ;
    }

    React.useEffect(() => {
        if(expandedItem !== 0){
            setExpand(false) ;
        }
    }, [expandedItem]) ;

    React.useEffect(() => {
        setLoading(true) ;
        UserAccountInfo(getCookie('_SOLSTICE_AUTHUSER')) ;
    }, []) ;

    React.useEffect(() => {
        if(accountName) {
            setLoading(false) ;
        }
    }, [accountName]) ;

    return (
        <Box className={classes.root} sx={{cursor : loading && 'wait !important'}}>
            <Accordion
                expanded={expand}
                onChange={(e, expanded) => TriggerExpandedItem(e, expanded, 0)}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{backgroundColor : 'rgba(51, 139, 239, 0.21) !important'}}
                >
                    <Box sx={{display : 'flex', justifyContent : 'flex-start', alignItems : 'center'}}>
                        <Box className={clsx(classes.circlePrefix, stripe_account_id && stripe_account_create_confirm_code === 'confirmed' && classes.active)} /><Box>Configure payments</Box>
                    </Box>
                </AccordionSummary>
                <AccordionDetails
                    sx={{padding : '10px'}}
                >
                    {
                        stripe_account_id ? (
                            stripe_account_create_confirm_code !== 'confirmed' 
                            ? <>
                                <Box className={classes.descriptionDiv}>
                                    In order to begin accepting payments, you must create a Stripe account.
                                    Stripe is a payment processing platform used by millions of online businesses including Google, Apple, Amazon, Facebook, and Discord.
                                    You're in good hands.
                                </Box>
                                <Button variant={'contained'} className={classes.buttonCss1} onClick={() => handleCompleteStripeAccount()} disabled={loading}>Complete Account</Button>
                            </>
                            : (
                                isStripeConnected ? <Box className={classes.descriptionDiv}>
                                    Your stripe account is connected with SOLSTICE stripe account.
                                    You can purchase product using your stripe account.
                                </Box> : <>
                                <Box className={classes.descriptionDiv}>
                                    Please, connect Solstice stripe account with your stripe account.
                                </Box>
                                <Button variant={'contained'} className={classes.buttonCss2} onClick={() => handleConnectToStripe()} disabled={loading}>Connect Stripe</Button>
                            </>
                            )
                        )
                        : <>
                            <Box className={classes.descriptionDiv}>
                                In order to begin accepting payments, you must create a Stripe account.
                                Stripe is a payment processing platform used by millions of online businesses including Google, Apple, Amazon, Facebook, and Discord.
                                You're in good hands.
                            </Box>
                            <Button variant={'contained'} className={classes.buttonCss1} onClick={() => handleCreateStripeAccount()} disabled={loading}>Create Account</Button>
                        </>
                    }
                </AccordionDetails>
            </Accordion>
        </Box>
       
    )
}
ConfigurePayment.propTypes = {
    ExpandedItem : PropTypes.func.isRequired,
    ConnectAppToStripe : PropTypes.func.isRequired,
    UserAccountInfo : PropTypes.func.isRequired
}
const mapStateToProps = state => ({
    expandedItem : state.setting.expandedItem,
    stripe_account_id : state.profile.stripe_account_id,
    stripe_customer_id :state.profile.stripe_customer_id,
    stripe_account_create_confirm_code : state.profile.stripe_account_create_confirm_code,

    profileLink : state.profile.profileLink,
    accountName : state.profile.accountName,
    email : state.profile.email,
    phoneNumber : state.profile.phoneNumber
})
const mapDispatchToProps = {
    ExpandedItem,
    ConnectAppToStripe,
    UserAccountInfo
}
export default connect(mapStateToProps, mapDispatchToProps)(ConfigurePayment) ;