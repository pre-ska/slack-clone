import React, { Component, Fragment } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import Message from "./Message";
import firebase from "../../firebase";

export class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    progressbar: false
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

    this.state.messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());

      clearTimeout(TO);

      TO = setTimeout(() => {
        this.setState({
          messages: loadedMessages,
          messagesLoading: false
        });
      }, 100);
    });
  };

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

  render() {
    const { messagesRef, channel, user, messages, progressBar } = this.state;

    return (
      <Fragment>
        <MessagesHeader />
        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}>
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessagesForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </Fragment>
    );
  }
}

export default Messages;
