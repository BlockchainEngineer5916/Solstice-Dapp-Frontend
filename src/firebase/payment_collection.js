import { set, ref, child, update} from 'firebase/database' ;
import { realDb } from "./config";

import { getCookie } from "../utils/Helper";

// Firebase Collection Pkg
import { UserInfoById , UpdateResellerCount, UpdateSellerCustomer} from "./user_collection";
import { UpdateBundleBuyersMeta, UpdateRareOwners , UpdateLegenOwners, UpdateLegenBuyers } from "./product_collection";
import { CreateNotify } from "./notify_collection";
import { CompleteBid } from "./bid_collection";

// Web3 Interact Pkg
import { SellNFT } from "../web3/market";

// Email Send Pkg
import { SendProductLink } from "../email";

// Stripe Api
import { retrievePaymentIntent } from "../stripe/payment_api";
import { createTransfer } from "../stripe/transfer_api";

import md5 from "md5";

import { toast } from 'react-toastify/dist/react-toastify';

export const CreatePayment = async (
    payment_intent_id,
    payment_intent_client_secret,

    creator_id,
    creator_wallet,
    creator_full_name,
    creator_account_name,
    creator_profile_picture_url,
    creator_profile_link,
    creator_email,
    creator_stripe_account_id,

    buyer_id,
    buyer_wallet,
    buyer_permission,

    product_id,
    product_name,
    price_type,
    product_price,
    price_unit,

    bid_amount,
    bid_id,
    nft_id,

    status
) => {
    try {

        const nodeRef = child(ref(realDb), "Web_Payments/" + payment_intent_id); // id = custom ID you want to specify 

        await set(nodeRef, {
            payment_intent_id : payment_intent_id,
            payment_intent_client_secret : payment_intent_client_secret,
            creator_id : creator_id,
            creator_wallet : creator_wallet,
            creator_full_name : creator_full_name,
            creator_account_name : creator_account_name,
            creator_profile_picture_url : creator_profile_picture_url,
            creator_profile_link : creator_profile_link,
            creator_email : creator_email,
            creator_stripe_account_id : creator_stripe_account_id,
            buyer_id : buyer_id,
            buyer_wallet : buyer_wallet,
            buyer_permission : buyer_permission,
            product_id : product_id,
            product_name : product_name,
            price_type : price_type,
            product_price : product_price,
            price_unit : price_unit,
            bid_amount : bid_amount,
            bid_id: bid_id,
            nft_id : nft_id,
            status : status
        }) ;

        return true ;

    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const UpdatePayment = async (old_payment_intent, payment_intent_id, status) => {
    try {
        let updates = {} ;

        updates['Web_Payments/' + payment_intent_id] = {
            ...old_payment_intent,
            status : status
        }

        update(ref(realDb), updates) ;

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const AutoCheckPayments = async (paymentsList) => {
    try {

        if(!paymentsList) return ;
        
        let myPaymentList = Object.entries(paymentsList).filter(([id, payment]) => 
            payment.buyer_id === getCookie('_SOLSTICE_AUTHUSER') &&
            payment.status !== 'succeeded'
        ) ;

        await Promise.all(
            myPaymentList.map(async ([id, payment]) => {
                console.log('here') ;

                let payment_intent = await retrievePaymentIntent(id) ;

                if(payment_intent.status !== payment.status) {
                    await UpdatePayment(payment, id, payment_intent.status) ;
                }

                if(payment_intent.status === 'succeeded') {
                    if(payment.price_type === 'bundle') {
                        let license_key = await UpdateBundleBuyersMeta(payment.product_id, payment.buyer_id) ;

                        if(license_key) {
                            let buyerInfo = await UserInfoById(payment.buyer_id) ;
            
                            await CreateNotify({
                                buyer : {
                                    email : buyerInfo.email,
                                    profile_link : buyerInfo.profile_link,
                                    account_name : buyerInfo.account_name 
                                },
                                price : payment.product_price,
                                product : payment.product_name,
                                unit : payment.price_unit,
                                purchased_at : new Date().toLocaleDateString(),
                                seller : payment.creator_id,
                                type : 'bundle'
                            }) ;


                            await SendProductLink(payment.creator_id, payment.buyer_id, payment.product_id, license_key) ;

                            toast('🦄  SOLSTICE Team sent link about ' + payment.product_name +' to you.\n Please, Check Your Email.' , {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                allowHtml: true,
                                progress: undefined,
                            });
                        }
                    }

                    if(payment.price_type === 'rare') {
                        let txSellNFT = await SellNFT(payment.buyer_wallet , md5(payment.buyer_id), payment.nft_id, payment.bid_amount) ;

                        if( txSellNFT === 200 ) {
                            await CompleteBid(payment.bid_id) ;
                            await UpdateRareOwners(payment.product_id, payment.buyer_id, payment.buyer_wallet) ;
                            await SendProductLink(payment.creator_id, payment.buyer_id, payment.product_id) ;

                            toast('🦄  SOLSTICE Team sent link about ' + payment.product_name +' to you.\n Please, Check Your Email.' , {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                allowHtml: true,
                                progress: undefined,
                            });
                        } 
                    }

                    if(payment.price_type === 'legendary') {
                        if(payment.buyer_permission === 'reseller') {
                            let txSellNFT = await SellNFT(payment.buyer_wallet, md5(payment.buyer_id), Number(payment.nft_id), 1) ;

                            if( txSellNFT !== 200 ) {
                                
                                return ;
                            }
                        }
                        
                        let buyerInfo = await UserInfoById(payment.buyer_id) ;
        
                        await CreateNotify({
                            buyer : {
                                email : buyerInfo.email,
                                profile_link : buyerInfo.profile_link,
                                account_name : buyerInfo.account_name ,
                                role : payment.buyer_permission === 'reseller' ? "reseller" : "buyer"
                            },
                            price : payment.product_price,
                            product : payment.product_name,
                            unit : payment.price_unit,
                            purchased_at : new Date().toLocaleDateString(),
                            seller : payment.creator_id,
                            type : 'legendary'
                        }) ;
        
                       

                        if(payment.buyer_permission === 'reseller') {
                            await UpdateResellerCount(payment.creator_id) ;
                            await UpdateLegenOwners(payment.product_id, payment.buyer_id, payment.buyer_wallet) ;
                        }
                        else await UpdateLegenBuyers(payment.product_id, payment.buyer_id, payment.buyer_wallet) ;

                        await SendProductLink(payment.creator_id, payment.buyer_id, payment.product_id) ;

                        toast('🦄  SOLSTICE Team sent link about ' + payment.product_name +' to you.\n Please, Check Your Email.' , {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            allowHtml: true,
                            progress: undefined,
                        });
                    }

                    await UpdateSellerCustomer(payment.creator_id, payment.buyer_id) ;

                    let req = {
                        "amount" : Number( Number(payment.product_price)  * 99 ).toFixed(0),
                        "currency" : "usd",
                        "destination" : payment.creator_stripe_account_id
                    } ;
                    
                    let res = await createTransfer(req) ;
                    
                    console.log(res) ;
                }
            })
        )
        return true ;
    } catch(err) {
        console.log(err) ;

        return false ;
    }
}