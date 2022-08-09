import ActionTypes from '../actions/actionTypes' ;

const INITIAL_STATE = {
   solInfo : null,
   creatorInfo : null,
   productInfo : null,
   buyerInfo : null,

   checkingProductUrl : true 
}

export default (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case ActionTypes.ProductPageInfo : 
            return ({
                ...state,
                solInfo : action.payload.solInfo,
                productInfo : action.payload.productInfo,
                buyerInfo : action.payload.buyerInfo,
                creatorInfo : action.payload.creatorInfo
            }) ;
        case ActionTypes.CheckingProductUrl : 
            return ({
                ...state,
                checkingProductUrl : action.payload
            }) ;
        case ActionTypes.InitPageInfo:
            return INITIAL_STATE ;
        default : 
            return state ;
    }
}