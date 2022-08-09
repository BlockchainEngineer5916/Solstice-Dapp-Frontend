import * as React from 'react' ;
import { Route, Routes } from 'react-router-dom';

import { connect } from 'react-redux' ;

import StripeAccountCreate from './StripeAccountCreate';
import NotFound from '../../components/Common/NotFound';

const Confirms = (props) => {
    return (
        <Routes>
            <Route path="/stripe-account-create" element={<StripeAccountCreate />} />
            <Route path="/*" element={<NotFound />}/>
        </Routes> 
    )
}

const mapStateToProps = state => ({
})  
const mapDispatchToProps = {
}
export default connect(mapStateToProps, mapDispatchToProps)(Confirms) ;