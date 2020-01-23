import Service, {inject as service} from '@ember/service';
import Evented from '@ember/object/evented';


export default Service.extend(Evented, {
  websockets: service(),

  _socketref: null, // WebSocket to send/receive messages to/from backend 
  _updateQueue: null, // Messages which are ready to be send to backend

});