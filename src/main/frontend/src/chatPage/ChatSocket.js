import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
const Container=styled.div`
    width: 100vw;
    height: 100vh;
    display:flex;
    justify-content: center;
    align-items: center;
.bodyArea{
    width:400px;
    height:600px;
    display:flex;
    flex-direction: column;
    border: 1px solid black;
}
.chatHeadArea{
    display: flex;
    justify-content: space-between;
    background-color: #CCC;
}
.chatContentArea{
    height:100%;
    overflow-y: scroll;
}
.sendArea{
    width: 100%;
    height: 25px;
    display: flex;

}
.msg_input {
     width: 100%;
     font-size:11px;
     line-height : normal;
     padding: .8em .5em;
     border: 1px solid #999;
     outline-style: none; /* 포커스시 발생하는 효과 제거를 원한다면 */
     -webkit-appearance: none; /* 브라우저별 기본 스타일링 제거 */
     -moz-appearance: none; appearance: none;

}
.msg_send {
     width: 100px;
     height: 25px;
     font-size: 11px;
     color: white;
     background-color: black;
     border: orange;
     &:hover{
        color:#CCC;
     }
}
.msg_close {
     width: 30px;
     font-size: 15px;
     background-color: white;
     border: none;


}
`
const ChatSocket = () => {
    const [socketConnected, setSocketConnected] = useState(false);
    const [inputMsg, setInputMsg] = useState("");
    const [rcvMsg, setRcvMsg] = useState("");
    const webSocketUrl = `ws://localhost:8111/ws/chat`;
    const roomId = window.localStorage.getItem("chatRoomId");
    const sender = "곰돌이사육사";
    let ws = useRef(null);
    const [items, setItems] = useState([]);

    const onChangMsg = (e) => {
        setInputMsg(e.target.value)
    }

    const onEnterKey = (e) => {
        if(e.key === 'Enter') onClickMsgSend(e);
    }

    const onClickMsgSend = (e) => {
        e.preventDefault();
        ws.current.send(
            JSON.stringify({
            "type":"TALK",
            "roomId": roomId,
            "sender": sender,
            "message":inputMsg}));
            setInputMsg("");
    }
    const onClickMsgClose = () => {
        ws.current.send(
            JSON.stringify({
            "type":"CLOSE",
            "roomId": roomId,
            "sender":sender,
            "message":"종료 합니다."}));
        ws.current.close();
    }

    useEffect(() => {
        console.log("방번호 : " + roomId);
        if (!ws.current) {
            ws.current = new WebSocket(webSocketUrl);
            ws.current.onopen = () => {
                console.log("connected to " + webSocketUrl);
            setSocketConnected(true);
            };
        }
        if (socketConnected) {
            ws.current.send(
                JSON.stringify({
                "type":"ENTER",
                "roomId": roomId,
                "sender": sender,
                "message":"처음으로 접속 합니다."}));
        }
        ws.current.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            console.log(data.message);
            setRcvMsg(data.message);
            setItems((prevItems) => [...prevItems, data]);
      };
    }, [socketConnected]);

    return (
        <Container>
            <div className="bodyArea">
                <div className="chatHeadArea">
                    <div>socket connected : {`${socketConnected}`}</div>
                    <button className="msg_close" onClick={onClickMsgClose}>&times;</button>
                </div>
                <div className="chatContentArea">
                    {items.map((item) => {
                    return <div>{`${item.sender} > ${item.message}`}</div>;
                    })}
                </div>
                <div className="sendArea">
                    <input className="msg_input" placeholder="문자 전송" value ={inputMsg} onChange={onChangMsg} onKeyUp={onEnterKey}/>
                    <button className="msg_send" onClick={onClickMsgSend}>전송</button>
                </div>
            </div>
        </Container>
      );
    };

    export default ChatSocket;