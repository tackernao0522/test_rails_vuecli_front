<template>
  <div class="container">
    <navbar-page />
    <chat-window
      @connectCable="connectCable"
      :messages="formattedMessages"
      ref="chatWindow"
    />
    <new-chat-form @connectCable="connectCable" />
  </div>
</template>

<script>
import axios from "../api/index";
import ActionCable from "actioncable";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import NavbarPage from '../components/NavbarPage.vue';
import ChatWindow from '../components/ChatWindow.vue';
import NewChatForm from '../components/NewChatForm.vue';

export default {
  components: { ChatWindow, NewChatForm, NavbarPage },
  data() {
    return {
      messages: [],
    };
  },
  computed: {
    formattedMessages() {
      if (!this.messages.length) {
        return [];
      }
      return this.messages.map((message) => {
        let time = formatDistanceToNow(new Date(message.created_at), {
          locale: ja,
        });
        return { ...message, created_at: time };
      });
    },
  },
  methods: {
    async getMessages() {
      try {
        const res = await axios().get("/messages", {
          headers: {
            uid: window.localStorage.getItem("uid"),
            "access-token": window.localStorage.getItem("access-token"),
            client: window.localStorage.getItem("client"),
          },
        });
        if (!res) {
          new Error("メッセージ一覧を取得できませんでした");
        }
        this.messages = res.data;
      } catch (err) {
        this.error = "メッセージ一覧を取得できませんでした";
      }
    },
    connectCable(message) {
      this.messageChannel.perform("receive", {
        message: message,
        email: window.localStorage.getItem("uid"),
      });
    },
  },
  mounted() {
    if (process.env.VUE_APP_API_ORIGIN == "http://localhost:3000") {
      const cable = ActionCable.createConsumer("ws://localhost:3000/cable");
      this.messageChannel = cable.subscriptions.create("RoomChannel", {
        connected: () => {
          this.getMessages().then(() => {
            this.$refs.chatWindow.scrollToBottom();
          });
        },
        received: () => {
          this.getMessages().then(() => {
            this.$refs.chatWindow.scrollToBottom();
          });
        },
      });
    } else {
      const cable = ActionCable.createConsumer(
        "wss://test-chatapp-api.herokuapp.com/cable"
      );
      this.messageChannel = cable.subscriptions.create("RoomChannel", {
        connected: () => {
          this.getMessages().then(() => {
            this.$refs.chatWindow.scrollToBottom();
          });
        },
        received: () => {
          this.getMessages().then(() => {
            this.$refs.chatWindow.scrollToBottom();
          });
        },
      });
    }
  },
  beforeUnmount() {
    this.messageChannel.unsubscribe();
  },
};
</script>

<style scoped>
</style>
