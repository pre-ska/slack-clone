import React, { Component } from "react";
import firebase from "firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";
import { Menu, Icon } from "semantic-ui-react";

export class DirectMessages extends Component {
  state = {
    activeChannel: "",
    users: [],
    user: this.props.currentUser,
    userRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref("info/connected"),
    presenceRef: firebase.database().ref("presence")
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = currentUserUid => {
    let loadedUsers = [];
    let TO;
    // za  popis logiranih korisnika:
    // 1.stavi child_added listener
    this.state.userRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        // 2.event će opaliti za sve registrirane korisnike sekvencijonalno
        //dodaj key iz doca u objekt i status offline (kao default)
        user["uid"] = snap.key;
        user["status"] = "offline";
        //gurni ga u array
        loadedUsers.push(user);

        // spremi sve regane korsinike u state
        clearTimeout(TO);
        TO = setTimeout(() => {
          this.setState({ users: loadedUsers });
        }, 200);
      }
    });

    // https://firebase.google.com/docs/database/web/offline-capabilities#section-connection-state
    //slušaj promjene u info/connected (user se logira ili odlogira)
    // ako je true - korisnik se logirao - spremi ga u presence kolekciju
    // userId: true
    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);
        ref.set(true);

        // ako se odlogira, ukloni ga iz kolekcije i hendlaj error ako postoji
        ref.onDisconnect().remove(err => {
          if (err != null) {
            console.error(err);
          }
        });
      }
    });

    // kada se doda novi child/korisnik u presence kolekciju
    // ako to nije trenutni korisnik
    // promjeni mu status u user arrayu u stateu na 'online'
    this.state.presenceRef.on("child_added", snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    // kada se iz presence kolekcije ukloni child
    // promjeni mu status u user arrayu u stateu na 'offline'
    this.state.presenceRef.on("child_removed", snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.user.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected} ? 'online' : 'offline'`;
      }

      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  isUserOnline = user => user.status === "online";

  // klik na korisnika u popisu da kreiram novi privatni chat
  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };

    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  setActiveChannel = userId => {
    this.setState({ activeChannel: userId });
  };

  getChannelId = userId => {
    const currentUserId = this.state.user.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  render() {
    const { users, activeChannel } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES &nbsp;
          </span>{" "}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}>
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? "green" : "red"}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(DirectMessages);
