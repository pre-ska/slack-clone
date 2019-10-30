import React, { Component } from "react";
import ReactDOM from "react-dom";
import App from "./components//App";
import registerServiceWorker from "./registerServiceWorker";
import "semantic-ui-css/semantic.min.css";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Spinner from "./Spinner";
import firebase from "firebase";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";

// redux
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";
import { setUser, clearUser } from "./actions";

/************************************************************/

const store = createStore(rootReducer, composeWithDevTools());

class Root extends Component {
  componentDidMount() {
    // čim se app učita, probaj ga autorizirati...
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.setUser(user);
        this.props.history.push("/");
      } else {
        this.props.history.push("/login");
        this.props.clearUser();
      }
    });
  }

  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapState = state => ({
  isLoading: state.user.isLoading
});

// moram napraviti HOC da bi mogao wrapati Root komponentu
//jer mi treba history u njoj
// da mogu nakon logina i registriranja preusmjerit na home
const RootWithAuth = withRouter(
  connect(
    mapState,
    { setUser, clearUser }
  )(Root)
);

// sa ovim nakon uspiješne registracije ili logina odma me preusmjeri
// na app komponentu (home) jer u componentDidMount ima da ako je user auth
// history push na '/'
// isto tako ako sam logiran i na prvi posjet me preusmjeri na '/'
ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);

registerServiceWorker();
