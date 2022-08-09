import React, { useEffect, useState } from "react";


import Loading from 'react-loading-components' ;

import { connect } from 'react-redux' ;
import PropTypes from 'prop-types' ;
import { CreatorProfile } from '../../redux/actions/payment' ; 

import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";

import {
    Box,
    Button,
    Grid
} from '@mui/material' ;

import { useTheme, makeStyles } from "@mui/styles";

import { useStyles } from "./StylesDiv/Checkout.styles";

const PaymentCheckOut = (props) => {
    const stripe = useStripe();
    const elements = useElements();
    const theme = useTheme() ;
    const classes = useStyles() ;
    
    const  {
        clientSecret
    }  = props ;

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [payable,setPayable] = useState(false) ;

    useEffect(() => {
        if (!stripe) {
            return;
        }

        if (!clientSecret) {
            return;
        }
        
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            console.log(paymentIntent) ;

            switch (paymentIntent.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    setPayable(false);
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    setPayable(false);
                    break;
                case "requires_payment_method":
                    setPayable(true) ;
                    break;
                default:
                    setMessage("Something went wrong.");
                    setPayable(true) ;
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {

            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: location.origin + '/solstice/stripe-screen',
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
            <Box className={classes.root}>
                {
                    <form id="payment-form" onSubmit={handleSubmit}>
                        <PaymentElement id="payment-element" />
                        {message && <Box id="payment-message" sx={{mt: '20px'}}>{message}</Box>}
                        <Box sx={{mt : '20px', display : 'flex', justifyContent : 'flex-end'}}>
                            <button disabled={isLoading || !stripe || !elements || !payable} id="submit">
                                {
                                    isLoading ? <>
                                        <Loading type='oval' width={30} height={30} fill={theme.palette.green.G200} /> ...Pending
                                    </>
                                    : "Pay now"
                                }
                            </button>
                        </Box>
                    </form>
                }
            </Box>
  );
}
PaymentCheckOut.propTypes = {
    CreatorProfile  : PropTypes.func.isRequired
}
const mapStateToProps = state => ({

})
const mapDispatchToProps = {
    CreatorProfile
}
export default connect(mapStateToProps, mapDispatchToProps)(PaymentCheckOut) ;