import {CellSwitch} from "@sy-inc/react";

export function Feature() {
  return (
    <div className="w-full max-w-sm">
      <CellSwitch badge="新" description="页面、会议和 AI 触手可及。" variant="feature">
        试用新版侧边栏
      </CellSwitch>
    </div>
  );
}
