import { ActorRef } from 'xstate';

import RadioEventType from './RadioEventType';

export type RadioActorRef = ActorRef<RadioEventType>;
