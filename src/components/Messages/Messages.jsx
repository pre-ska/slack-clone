import React, { Component, Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import Message from "./Message";
import firebase from "../../firebase";

export class Messages extends Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    progressbar: false,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: []
  };

  componentDidMount() {
    const { channel, user } = this.state;
    if (channel && user) this.addListeners(channel.id);
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    let TO;

    //ako je privatni chat, koristi privateMessagesRef
    // ako nije koristi messagesRef
    const ref = this.getMessagesRef();

    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());

      clearTimeout(TO);
      // child_added dodaje listenere pojedinačno na svaku poruku
      //pa mi se onda re-renderira komponentta svaki put
      // zato setTimeout
      TO = setTimeout(() => {
        this.setState({
          messages: loadedMessages,
          messagesLoading: false
        });

        this.countUniqueUsers(loadedMessages);
      }, 100);
    });
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;

    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleSearchChange = e => {
    //na svaki search input, spremam searchTerm u state i
    //češljam messages array u callbacku
    this.setState(
      {
        searchTerm: e.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    let TO;

    // vrati mi samo poruke koje sadržavaju searchTerm
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);

    // spremi taj novi array u state
    this.setState({ searchResults });

    //animacija u inputu...
    clearTimeout(TO);
    TO = setTimeout(() => {
      this.setState({ searchLoading: false });
    }, 500);
  };

  countUniqueUsers = messages => {
    //izbroji koliko ima sudionika u chatu...preko imena u porukama
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }

      return acc;
    }, []);

    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;

    this.setState({ numUniqueUsers });
  };

  // glavna funkcija koja vrti messages array
  displayMessages = messages =>
    messages.length &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
  };

  //privatni kanali počinju sa @
  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  render() {
    const {
      messagesRef,
      channel,
      user,
      messages,
      progressBar,
      numUniqueUsers,
      searchResults,
      searchTerm,
      searchLoading,
      privateChannel
    } = this.state;

    return (
      <Fragment>
        <MessagesHeader
          numUniqueUsers={numUniqueUsers}
          channelName={this.displayChannelName(channel)}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
        />
        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}>
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessagesForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          isProgressBarVisible={this.isProgressBarVisible}
          getMessagesRef={this.getMessagesRef}
        />
      </Fragment>
    );
  }
}

export default Messages;
