// This example assumes Buttplug is brought in as a root namespace, via
// inclusion by a script tag, i.e.
//
// <script lang="javascript" 
//   src="https://cdn.jsdelivr.net/npm/buttplug-wasm@1.0.0/dist/web/buttplug.js">
// </script>
//
// If you're trying to load this, change the version to the latest available.

async function runDeviceControlExample() {
  // Instantiate our wasm module. This only needs to be done once. If you did it
  // elsewhere, ignore this.
  await Buttplug.buttplugInit();

  // Usual embedded connector setup.
  const connector = new Buttplug.ButtplugEmbeddedConnectorOptions();
  const client = new Buttplug.ButtplugClient("Device Control Example");
    await client.connect(connector);


  // Set up our DeviceAdded/DeviceRemoved event handlers before connecting. If
  // devices are already held to the server when we connect to it, we'll get
  // "deviceadded" events on successful connect.
  client.addListener("deviceadded", async (device) => {
    console.log(`Device Connected: ${device.Name}`);
    console.log("Client currently knows about these devices:");
    client.Devices.forEach((device) => console.log(`- ${device.Name}`));

    // In Javascript, allowedMessages is a map, so we'll need to iterate its
    // properties.

    console.log("Sending commands");

    // If we aren't working with a toy that vibrates, just return at this point.
    if (!device.messageAttributes(Buttplug.ButtplugDeviceMessageType.VibrateCmd)) {
      return;
    }

    // Now that we know the message types for our connected device, and that our
    // device handles vibration, we can send a message over!
    //
    // There's a couple of ways to send this message.

    // We can use the convenience functions on ButtplugClientDevice to
    // send the message. This version sets all of the motors on a
    // vibrating device to the same speed.
      async function move(p) {
          try {
              await device.vibrate(p);
          } catch (e) {
              console.log(e);
              if (e instanceof Buttplug.ButtplugDeviceError) {
                  console.log("got a device error!");
              }
          }
      }
      let play_time = 0;
      let play_time_now = 0;
      const play_time_end = 7200000;
      let now_time = 0;
      let pass_time = 0;
      let pass_timer_start;
      let now_time_tmp = 0;
      var result = [];
      /*
      const time = () => {
      }
      setInterval(time, 300000);
      */

      //CSVファイルを読み込む関数getCSV()の定義
      function getCSV() {
          var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
          req.open("get", "test.csv", true); // アクセスするファイルを指定
          req.send(null); // HTTPリクエストの発行

          // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
          req.onload = function () {
              convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
          }
      }

      // 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
      function convertCSVtoArray(str) { // 読み込んだCSVデータが文字列として渡される
          var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

          // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
          for (var i = 0; i < tmp.length; ++i) {
              result[i] = tmp[i];
             // console.log(result[i]);
          }

          
      }

  
      function world_timer() {
          let xhr = new XMLHttpRequest();
          xhr.open('GET', "https://worldtimeapi.org/api/timezone/Asia/Tokyo");
          xhr.responseType = 'json';
          xhr.send();
          pass_timer_start = new Date();

          xhr.onload = () => {
              now_time_tmp = now_time;
              now_time = JSON.parse(JSON.stringify(xhr.response)).unixtime + parseFloat("0" + (JSON.stringify(xhr.response.utc_datetime)).substr(20, 6));
              console.log(now_time);
              pass_timer_start = new Date();
              console.log((now_time-now_time_tmp)*1000 + "s");

          }

          setTimeout(world_timer, 180000);
      };

      function pass_timer() {
          let pass_timer_end = new Date();
          pass_time = (pass_timer_end.getTime() - pass_timer_start.getTime())/1000;
          now_time += pass_time;
          pass_timer_start = new Date();
         // console.log("ima:" +now_time);
          setTimeout(pass_timer, 20);
      };
      function play_time_setter(){
          let now_time_ms = now_time * 1000;
          play_time = parseInt(now_time_ms % play_time_end);
          play_time_now = parseInt(play_time % 100);
          //console.log(play_time);
         // console.log(parseInt(play_time%100));
          setTimeout(play_time_setter, 20);
      };

      async function play() {
          //console.log(result[play_time]);
          move((result[play_time/100])/100.0);
          await new Promise(r => setTimeout(r, 100));
          setTimeout(play, 100);
      };
      async function test() {
          console.log(play_time)
          setTimeout(test, 500);
      };
      getCSV(); //最初に実行される
      world_timer();
      pass_timer();
      play_time_setter();
      play();
      test();
     /* while (1) {
          move(1.0);
          await new Promise(r => setTimeout(r, 500));
          move(0);
          await new Promise(r => setTimeout(r, 500));
          //await device.stop();
      }*/

    // If we wanted to just set one motor on and the other off, we could
    // try this version that uses an array. It'll throw an exception if
    // the array isn't the same size as the number of motors available as
    // denoted by FeatureCount, though.
    //
    // You can get the vibrator count using the following code, though we
    // know it's 2 so we don't really have to use it.
    //
    // This vibrateType variable is just used to keep us under 80 
    // characters for the dev guide, so don't feel that you have to reassign 
    // types like this. I'm just trying to make it so you don't have to
    // horizontally scroll in the manual. :)

    /*
    var vibratorCount =
      device.AllowedMessages[vibrateType].FeatureCount;
    await testClientDevice.SendVibrateCmd(new [] { 1.0, 0.0 });
    */
  });
  client
    .addListener("deviceremoved", (device) => console.log(`Device Removed: ${device.Name}`));

  // Now that everything is set up, we can scan.
  await client.startScanning();
};
