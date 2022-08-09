import axios from 'axios';
import qs from 'qs' ;
import { validate as uuidValidate } from 'uuid' ; 
import { version as uuidVersion } from 'uuid' ; 

export const setCookie = async (cname, cvalue) => {
    const d = new Date();
    d.setTime(d.getTime() + (24*60*60*1000));
    let expires = "expires="+ d.toUTCString();

    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
}

export const eraseCookie = async (cname) => {
    document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return ;
}

export const bytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export const validateInputValue = (inputValue) => {
    var inputValueRegex = /^[a-zA-Z0-9]+$/;
    return inputValueRegex.test(inputValue);
}

export const getYoutubeId = (url) => {
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}
export const isYoutubeUrl = (url) => {
    return url && url.match(/(?:youtu|youtube)(?:\.com|\.be)\/([\w\W]+)/i);
}

export const getFileType = (type) => {
    let file_type = type.split('/')[0] ;
    let ext = type.split('/')[1] ;
    switch(file_type) {
        case 'video' :
        case 'image' :
        case 'audio' :
            return file_type ;
        case 'application' :
            return ext ;
        default : 
            return 'other' ;
    }
}

export const getFileExtension = (raw_file_type) => {
    if(!raw_file_type) return 'unknown' ;
    
    let extension = raw_file_type.split('/')[1] ;
    if(extension === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return "docx"
    } else {
        return extension ;
    }
}

export const removeExtension = (filename) => {

    return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

export const convertObjToString = (obj) => {
    if(!obj) return new Date().getTime();

    return  obj.month + "/" + obj.day + "/" + obj.year ;
}

export const walletAddressFormat = (walletAddress) => {
    if(!walletAddress) return "Lock" ;
    return walletAddress.slice(0, 6) + "..." + walletAddress.slice(walletAddress.length - 4, walletAddress.length) ;
}

export const fileNameFormat = (fileName) => {
    if(!fileName) return "Unknown" ;
    if(fileName.legnth > 10)  return fileName.slice(0, 6) + "..." + fileName.slice(fileName.length - 4, fileName.length) ;
    else return fileName ;
}

export const getUnit = (unit_id) => {
    switch(unit_id) {
        case 0 :
            return "USD";
        case 1 : 
            return "SOLT";
        default :
            return "" ;
    }
}

export const getDecimal = (unit_id) => {
    switch(Number(unit_id)) {
        case 0 :
            return "6";
        case 1 : 
            return "6";
        default :
            return "" ;
    }
}
 
export const getProductId = (product_type) => {
    if(product_type === '' || !product_type) return "Unknown";

    switch(product_type.toString().toLowerCase().replaceAll('#', '')) {
        case "ebook" : 
            return 0 ;
        case "video" :
            return 1 ;
        case "image" : 
            return 2;
        case "music" :
            return 3 ;
        default :
            return false ;
    }
}

export const getProductType = (product_id) => {
    switch(product_id) {
        case 0 : 
            return "#Ebook" ;
        case 1 :
            return "#Video" ;
        case 2 : 
            return "#Image";
        case 3 :
            return "#Music" ;
        default :
            return false ;
    }
}
export const getPriceId = (price_type) => {
    switch(price_type.toLowerCase().replaceAll('#', '')) {
        case "legendary" : 
            return 0 ;
        case "rare" :
            return 1 ;
        case "bundle" : 
            return 2;
        case "free" :
            return 3 ;
        default :
            return false ;
    }
}

export const getPriceType = (price_id) => {
    switch(price_id) {
        case 1 :
            return "Legendary" ;
        case 2:
            return "Rare" ;
        case 3:
            return "Bundle" ;
        case 4 :
            return "Free";
        default :
            return '';
    }
}

export const getUuid = (authObj) => {
    return JSON.parse(authObj)?.uuid ;
}
export const getPlatform = (authObj) => {
    return JSON.parse(authObj)?.platform
} 

export const uuidValidateV4 = async (uuid) => {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4 ;
}

export const isset = (value) => {
    try {
        if(typeof value === 'undefined') return false ;
        return true ;     
    } catch(err) {
        console.log(err) ;
        return false ;
    }
}

export const authorization = () => {
    return {
        headers: { Authorization: `Bearer ` + getCookie('idToken') }
    }
}

export const postData = async ( startPoint, body) => {
    try {
        let bodyData = qs.stringify(body) ;

        let res = await axios({
            method : 'post',
            url : 'https://api.stripe.com/v1' + startPoint,
            headers : { 
                'Authorization' : `Bearer ` +  process.env.REACT_APP_STRIPE_PRV_KEY ,
                'Content-Type':'application/x-www-form-urlencoded'
            },
            data : bodyData
        }) ;

        return res ;
    } catch(err) {
        console.log(err) ;
        return false ;
    }
    
}
export const errorHandler = (err) => {
    try {
        if(err.response.status === 429){
            return "Too Many Requests." ;
        }
        if(err.response.status === 401){
            return "Unauthorized" ;
        }
        if(err.response.status >= 400 && err.response.status < 500){
            console.log(err.response.data.message) ;
            return err.response.data.message ;
        }
    } catch(error){
        console.log("error" , err);
        return "Server Side Error" ;
    }
}

export const isAuthenticated = () => {
    if(getCookie('_SOLSTICE_AUTHUSER')) {
        return true ;
    }
    return false ;
}

export const refreshTokenSetup = (res) => {
    let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60 ) * 1000 ;

    const refreshToken  = async () => {
        const newAuthRes = await res.reloadAuthResponse() ;

        refreshTiming = ( newAuthRes.expires_in || 3600 - 5 * 60 ) * 1000 ;

        console.log('new Auth Res:', newAuthRes) ;
        console.log(refreshToken, refreshTiming) ;
    } ;

    setTimeout(refreshToken, refreshTiming) ;
}