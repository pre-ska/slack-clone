import React from "react";
import "./App.css";
import { connect } from "react-redux";

import { Grid } from "semantic-ui-react";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import MetaPanel from "./MetaPanel/MetaPanel";
import Messages from "./Messages/Messages";

const App = ({ currentUser, currentChannel }) => {
  return (
    <Grid columns="equal" className="app" style={{ background: "#eee" }}>
      <ColorPanel />
      <SidePanel
        key={currentUser && currentUser.uid}
        currentUser={currentUser}
      />
      <Grid.Column style={{ marginLeft: "300px" }}>
        <Messages
          key={currentChannel && currentChannel.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
        />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

const mapState = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel
});

export default connect(mapState)(App);
