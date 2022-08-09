import emailjs from 'emailjs-com';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getUnit } from '../utils/Helper';

export const SendPaymentLink = async (linkUrl, productInfo, from_name, from_email, to_email) => {
    try {

        let message = `
            <html>
                <body>
                    <h1>SOLSTICE Team!</h1><br/>
        ` ;

        message += ( "Creator : " + from_name + "<br/>" ) ;
        message += ( "From : " + from_email + "<br/>" ) ;
        message += ( "To : " + to_email + "<br/>" ) ;

        message += "Product Information<br/>" ;

        message += ( "Product Name : " + productInfo.product_name + "<br/>") ;
        message += ( "Product Description : " + productInfo.product_description + "<br/>" ) ;
        message += ( "Product Type : " + productInfo.product_type + "<br/>" ) ;
        
        if(productInfo.price_type === 'legendary') {
            message += ( "Product Price : " + productInfo.product_price + "<br/>" ) ;
            message += ( "Product Currency : " + getUnit(productInfo.product_unit) + "<br/>" ) ;
            message += ( "Ticket Price : " + productInfo.ticket_price  + "<br/>") ;
            message += ( "Ticket Currency : " + getUnit(productInfo.ticket_unit) + "<br/>" ) ;
            message += ( "Royalty : " + productInfo.royalty + "<br/>" ) ;
            message += ( "Created At : " + new Date(productInfo.created_at).toLocaleDateString() + "<br/>" ) ;
        }

        if(productInfo.price_type === 'rare') {
            message += ( "Minimum Bidding Price : " + productInfo.minimum_bidding + "<br/>" ) ;
            message += ( "Bid Currency : " + getUnit(productInfo.bid_unit) + "<br/>" ) ;
            message += ( "Royalty : " + productInfo.royalty + "<br/>" ) ;
            message += ( "NFT ID : #" + productInfo.nft_id + "<br/>" ) ;
            message += ( "Created At : " + new Date(productInfo.created_at).toLocaleDateString() + "<br/>" ) ;
        }

        if(productInfo.price_type === 'bundle') {
            message += ( "Price : " + productInfo.bundle_price + "<br/>" ) ;
            message += ( "Currency : " + getUnit(productInfo.bundle_unit) + "<br/>" ) ;
            message += ( "Created At : " + new Date(productInfo.created_at).toLocaleDateString() + "<br/>" ) ;
        }

        if(productInfo.price_type === 'free') {
            message += ( "Created At : " + new Date(productInfo.created_at).toLocaleDateString() + "<br/>" ) ;
        }

        message += "Link URL : " + linkUrl ;

        message += `
            </body>
                </html>
        ` ;

        console.log(message) ;

        var templateParams = {
            from_email : from_email ,
            to_email : to_email,
            message : message
        }

        let res = await emailjs.send(process.env.REACT_APP_EMAIL_SERVICE_ID, process.env.REACT_APP_EMAIL_TEMPLATE_ID, templateParams, process.env.REACT_APP_EMAIL_USER_ID) ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const SendProductLink = async (seller_id, buyer_id, product_id, license_key=null) => {
    try {
        let sellerDoc = await getDoc(doc(db, "Web_Users", seller_id)) ;
        let buyerDoc = await getDoc(doc(db, "Web_Users", buyer_id)) ;
        let productDoc = await getDoc(doc(db, "Web_Products", product_id)) ;

        let message = `
            <html>
                <body>
                    <h1>SOLSTICE Team!</h1><br/>
        ` ;

        message += ( "Creator : " + sellerDoc.data().account_name ) ;
        message += ( "From : " + buyerDoc.data().email + "<br/>" ) ;
        message += ( "To : " + buyerDoc.data().email + "<br/>" ) ;

        message += ( "Product URL : " + "https://solsapp.com/product-link?access_key=" + productDoc.data().access_key ) ;
        
        if(license_key) message  += ( "&license_key=" + license_key ) ;
        
        message += `
            </body>
                </html>
        ` ;

        var templateParams = {
            from_email : sellerDoc.data().email ,
            to_email : buyerDoc.data().email,
            message : message
        }

        let txSendEmail = await emailjs.send(process.env.REACT_APP_EMAIL_SERVICE_ID, process.env.REACT_APP_EMAIL_TEMPLATE_ID, templateParams, process.env.REACT_APP_EMAIL_USER_ID) ;

        return true ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}