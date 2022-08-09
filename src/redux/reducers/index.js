import  { combineReducers } from 'redux' ;

import authReducer from './auth';
import profileReducer from './profile';
import uploadReducer from './upload';
import cloudReducer from './cloud' ;
import cartReducer from './cart' ;
import settingReducer from './setting' ;
import usersReducer from './users' ;
import notifyReducer from './notify' ;
import transactionReducer from './transaction' ;
import stripeReducer from './stripe' ;
import linkReducer from './link' ;
import solReducer from './sol' ;
import paymentReducer from './payment' ;
import walletReducer from './wallet' ;

export default combineReducers({
    auth : authReducer,
    profile : profileReducer,
    cloud : cloudReducer,
    cart : cartReducer,
    setting : settingReducer,
    users : usersReducer,
    sol : solReducer,
    stripe : stripeReducer,
    notify : notifyReducer,
    transaction : transactionReducer,
    link : linkReducer,
    payment : paymentReducer,
    wallet : walletReducer ,
    upload : uploadReducer 
});