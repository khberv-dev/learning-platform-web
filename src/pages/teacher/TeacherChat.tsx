import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";

export default function TeacherChat() {
  const [msg, setMsg] = useState("");

  return (
    <div className="page active" id="page-teacher-chat">
      <div className="content">
        <div className="chat-wrap">
          <div className="clist">
            <div className="clist-hdr"><svg><use href="#i-msg" /></svg>Conversations</div>

            <div className="cc act">
              <Avatar tone="blue" text="AT" />
              <div className="cc-info">
                <div className="cc-name">Alex Turner</div>
                <div className="cc-prev">Can you explain lesson 4?</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="ct">2m</div>
                <div className="udot" style={{ background: "var(--accent)" }} />
              </div>
            </div>

            <div className="cc">
              <Avatar tone="green" text="MR" />
              <div className="cc-info">
                <div className="cc-name">Mia Rodriguez</div>
                <div className="cc-prev">Thank you so much!</div>
              </div>
              <div className="ct">1h</div>
            </div>
          </div>

          <div className="cmain">
            <div className="chdr">
              <Avatar tone="blue" text="AT" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Alex Turner</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--green)" }}>
                  <span className="odot" />Online
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button className="icon-btn"><svg><use href="#i-phone" /></svg></button>
                <button className="icon-btn"><svg><use href="#i-video" /></svg></button>
              </div>
            </div>

            <div className="cmsgs">
              <div className="msg r"><div className="mb">Hi! I'm having trouble understanding lesson 4 — the part about factoring by grouping</div><div className="mtime">2:11 PM</div></div>
              <div className="msg s"><div className="mb">Sure! Factoring by grouping is when you split a 4-term polynomial into two pairs and factor each</div><div className="mtime">2:13 PM</div></div>
              <div className="msg r"><div className="mb">Can you explain lesson 4 with an example?</div><div className="mtime">2:14 PM</div></div>
              <div className="msg s"><div className="mb">Of course! Take x³ + 2x² + 3x + 6 → (x²+3)(x+2)</div><div className="mtime">2:15 PM</div></div>
            </div>

            <div className="cinput">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} type="text" placeholder="Type a message..." />
              <Button variant="primary" size="sm" onClick={() => setMsg("")}><svg><use href="#i-send" /></svg></Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}