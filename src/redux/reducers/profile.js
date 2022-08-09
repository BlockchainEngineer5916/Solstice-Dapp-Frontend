import ActionTypes from "../actions/actionTypes";

const INITIAL_STATE = {
    loadingProductsList : false,

    stripe_account_id : null,
    stripe_customer_id : null,
    stripe_account_create_confirm_code : null,

    accountName : null,
    fullName : null,
    email : null,

    profileLink : null,
    coverPictureUrl : null,
    profilePictureUrl : null,

    productTypeList : [],
    jobTag : null,

    productCount : 0,
    platformCount : 0,
    resellerCount : 0,

    joinedDate : null,
    hostId : null,
    profileMessage : '',

    productsList : [],

    customers : []
}

export default function profile(state=INITIAL_STATE, action={}){
    switch(action.type) {
        case ActionTypes.UserAccountInfo : 
            return ({
                ...state,
                stripe_account_id : action.payload.stripe_account_id,
                stripe_customer_id : action.payload.stripe_customer_id,
                stripe_account_create_confirm_code : action.payload.stripe_account_create_confirm_code,
                
                coverPictureUrl : action.payload.coverPictureUrl,
                profilePictureUrl : action.payload.profilePictureUrl,

                productTypeList : action.payload.productTypeList,
                jobTag : action.payload.jobTag,

                accountName : action.payload.accountName,
                fullName : action.payload.fullName,
                email : action.payload.email,
                phoneNumber : action.payload.phone_number,

                productCount : action.payload.productCount,
                platformCount : action.payload.platformCount,
                resellerCount : action.payload.resellerCount,

                joinedDate : action.payload.joinedDate,
                hostId : action.payload.hostId,
                profileMessage : action.payload.profileMessage,

                profileLink : action.payload.profileLink,

                customers : action.payload.customers
            }) ;
        case ActionTypes.UpdateProfileMessage : 
            return ({
                ...state,
                profileMessage : action.payload
            }) ;
        case ActionTypes.LoadingProductsList : 
            return ({
                ...state,
                loadingProductsList : action.payload
            }) ;
        case ActionTypes.UserAllProducts : 
            return ({
                ...state,
                productsList : action.payload
            })
        default :
            return state ;
    }
}