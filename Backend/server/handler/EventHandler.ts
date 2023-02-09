import type WebSocket from 'ws';

/**
 * type SevenTVResponse = {
  op: number;
  t: number;
  d: Dispatch;
};

interface Dispatch {
  type: string;
  body: {
    id: string;
    actor: Actor;
    updated: Event[];
  };
  matches: number[];
}

interface Actor {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  roles: string[];
  connections: any[];
}

interface Event {
  key: string;
  index: number;
  nested: boolean;
  type: string;
  value: {
    old_value: string;
    value: string;
  }[];
}

const OPEvents = {
  Dispatch: 0,
  Hello: 1,
  Heartbeat: 2,
  ACK: 5,
  EndOfStream: 7,
  Subscribe: 35,
  UnSubscribe: 36,
};

export async function EventHandler(e: WebSocket.RawData) {
  const data: SevenTVResponse = JSON.parse(e.toString());
  switch (data.op) {
    case OPEvents.Hello: {
      const GetKeys = await Bot.Redis.getKeys("*current7tvset*");
      GetKeys.forEach(async (key) => {
        const split = key.split(":")[1];

        const currentEmoteSet = await Bot.Redis.get(key);
        const [userID, stvID] = split.split("-");

        const EmoteSetUpdatePayload = sendMessage(
          OPEvents.Subscribe,
          "emote_set.update",
          currentEmoteSet!
        );
        Bot.EventAPI.send(EmoteSetUpdatePayload);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const UserUpdatePayload = sendMessage(
          OPEvents.Subscribe,
          "user.update",
          stvID
        );
        Bot.EventAPI.send(UserUpdatePayload);

        Bot.Logger.Log(
          `Subscribed to ${userID} - ${stvID}, ${currentEmoteSet}`
        );
      });
      break;
    }
    case OPEvents.Dispatch: {
      onDispatchHandler(data.d);
      break;
    }
    case OPEvents.ACK: {
      break;
    }
    case OPEvents.Heartbeat: {
      break;
    }
    default: {
      Bot.Logger.Warn(`Unhandled event: ${data.op}`);
    }
  }
}

const onDispatchHandler = (data: Dispatch) => {
  const { type, body } = data;
  switch (type) {
    case "emote_set.update": {
      console.log(body);
      break;
    }
    case "user.update": {
      const { old_value, value } = body.updated[0].value[1];
      if (old_value === value) return;
      UnSubscribe("emote_set.update", old_value);
      Subscribe("emote_set.update", value);
      console.log(old_value, value);
      break;
    }
    default: {
      Bot.Logger.Warn(`Unhandled dispatch: ${type}`);
    }
  }
};

const Subscribe = (type: string, object_id: string): void => {
  const Payload = sendMessage(OPEvents.Subscribe, type, object_id);
  Bot.EventAPI.send(Payload);
};

const UnSubscribe = (type: string, object_id: string): void => {
  const Payload = sendMessage(OPEvents.UnSubscribe, type, object_id);
  Bot.EventAPI.send(Payload);
};

const sendMessage = (code: number, type: string, object_id: string): object => {
  return {
    op: code,
    d: {
      type,
      condition: {
        object_id,
      },
    },
  };
};
 */
