import React, { useEffect, useState } from "react";

import Loading from 'react-loading-components' ;

import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

import {
    Box,
    Button,
} from '@mui/material' ;

import { useTheme, makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
    root : {
        color : theme.palette.green.G200 + " !important",
        "& iframe" : {
           border : '1px solid red'
        },

        "& button" : {
            textTransform : 'capitalize !important',
            color : theme.palette.green.G200, fontSize : 20,
            minWidth : '150px !important',
            borderRadius : 25,
            border : 'none !important',
            height : 45,
            backgroundColor : theme.palette.blue.B300 + ' !important',
            cursor : 'pointer'
        }
    }
})) ;

const CheckoutForm = (props) => {
    const stripe = useStripe();
    const elements = useElements();
    const theme = useTheme() ;
    const classes = useStyles() ;

    const {
        redirectUrl
    } = props ;

    const [message, setMessage] = useState("asdfasdffd");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const confirm_client_secret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
          );

        if (!confirm_client_secret) {
            return;
        }
        
        stripe.retrievePaymentIntent(confirm_client_secret).then(({ paymentIntent }) => {
            console.log(paymentIntent) ;

            switch (paymentIntent.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                     break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
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
                return_url: redirectUrl,
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
            <form id="payment-form" onSubmit={handleSubmit}>
                <PaymentElement id="payment-element" />
                <Box sx={{mt : '20px', display : 'flex', justifyContent : 'flex-end'}}>
                    <button disabled={isLoading || !stripe || !elements} id="submit">
                        {
                            isLoading ? <Loading type='oval' width={30} height={30} fill={theme.palette.green.G200} /> 
                            : "Pay now"
                        }
                    </button>
                </Box>
                {message && <div id="payment-message">{message}</div>}
            </form>
        </Box>
  );
}

export default CheckoutForm ;