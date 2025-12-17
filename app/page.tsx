"use client";

import { Elsie, Margarine } from "next/font/google";
import { useState } from "react";
import { useRef } from "react";

export default function Page() {

  type Form = {
    isStu: boolean | null;
    salw: string;
    b0v: string;
    b0q: string;
  };
  type TradeRow = {
    id: string;
    side: "buy" | "sell" | null;
    qty: string;
    jpy: string;
    fee: string;
  };

  const [show, setShow] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const didScrollRef = useRef(false);
  const [salwView, setSalwView] = useState("");

  const createEmptyRow = () => ({
    id: crypto.randomUUID(),
    side: null,
    qty: "",
    jpy: "",
    fee: "",
  });

  const [rows, setRows] = useState<TradeRow[]>(
    Array.from({ length: 11 }, createEmptyRow)
  );


  const [form, setForm] = useState<Form>({
    isStu: null,
    salw: "",
    b0v: "",
    b0q: "",
  });

  const [fixed, setFixed] = useState("");
  const [plSum, setPlSum] = useState(0);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(0);

  function getBuyQty(rows: TradeRow[]): number {
    let buyQty = 0;
    for (const row of rows) {
      if (row.side === "buy" && row.qty !== "") {
        buyQty = buyQty + Number(row.qty)
      }
    }
    return (buyQty)
  }

  function getBuySum(rows: TradeRow[]): number {
    let buySum = 0;
    for (const row of rows) {
      if (row.side === "buy" && row.jpy !== "") {
        buySum = buySum + Number(row.jpy)
      }
    }
    return buySum
  }

  function getSellQty(rows: TradeRow[]): number {
    let sellQrt = 0;
    for (const row of rows) {
      if (row.side === "sell" && row.qty !== "") {
        sellQrt = sellQrt + Number(row.qty)
      }
    }
    return sellQrt
  }

  function getSellSum(rows: TradeRow[]): number {
    let sellSum = 0;
    for (const row of rows) {
      if (row.side === "sell" && row.jpy !== "") {
        sellSum = sellSum + Number(row.jpy)
      }
    }
    return sellSum
  }

  function getFeeSum(rows: TradeRow[]): number {
    let feeSum = 0;
    for (const row of rows) {
      if (row.fee !== "") {
        feeSum = feeSum + Number(row.fee)
      }
    }
    return feeSum
  }

  function getYrBuy(rows: TradeRow[]): number {
    let yrBuy = 0;
    for (const row of rows) {
      if (row.side === "buy") {
        yrBuy = yrBuy + Number(row.jpy) + Number(row.fee)
      }
    }
    return yrBuy

  }

  return (

    <div>
      <div style={{
        textAlign: "center",
        fontSize: "32px",
        margin: "50px 0",
      }}>
        仮想通貨損益合計計算ツール
      </div>

      <div style={{ maxWidth: "340px", margin: "50px auto" }}>
        <div style={{
          display: "flex",
          gap: "12px",
        }}>
          <div>学生ですか？</div>
          <div style={{
            display: "flex",
            gap: "8px"
          }}>
            <button
              style={{
                padding: "6px 10px",
                border: form.isStu === true ? "2px solid #7897ffff" : "1px solid #ccc",
              }}
              onClick={() => setForm({ ...form, isStu: true })}
            >
              はい
            </button>
            <button
              style={{
                padding: "6px 10px",
                border: form.isStu === false ? "2px solid #7897ffff" : "1px solid #ccc",
              }}
              onClick={() => setForm({ ...form, isStu: false })}
            >
              いいえ
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", margin: "15px 0" }}>
          <div>あなたの給与所得：</div>
          <input
            style={{ width: "80px", padding: "6px 10px", border: "1px solid #ccc" }}
            value={
              form.salw === ""
                ? ""
                : Number(form.salw).toLocaleString()
            }
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, "");
              /^[0-9]*$/.test(raw) &&
                setForm({ ...form, salw: raw });
            }}
          />

          <div>万円</div>
        </div>

        <div style={{ display: "flex", gap: "12px", margin: "15px 0" }}>
          <div>年初保有額：</div>
          <input
            style={{ width: "100px", padding: "6px 10px", border: "1px solid #ccc" }}
            value={
              form.b0v === ""
                ? ""
                : Number(form.b0v).toLocaleString()
            }
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, "");
              /^[0-9]*$/.test(raw) &&
                setForm({ ...form, b0v: raw });
            }}
          />

          <div>円</div>
        </div>

        <div style={{ display: "flex", gap: "12px", margin: "15px 0" }}>
          <div>年初保有数量：</div>
          <input
            style={{ width: "80px", padding: "6px 10px", border: "1px solid #ccc" }}
            value={form.b0q}
            onChange={(e) =>
              /^[0-9]*$/.test(e.target.value) &&
              setForm({ ...form, b0q: e.target.value })
            }
          />
          <div>BTC, ETH,<br />XTP, etc...</div>
        </div>
      </div>

      <div style={{ maxWidth: "770px", margin: "30px auto" }}>以下に取引データを入力：</div>
      {rows.map((row, i) => (
        <div key={row.id} style={{ display: "flex", gap: "12px", maxWidth: "770px", margin: "10px auto" }}>

          <button
            style={{
              padding: "6px 10px",
              border: row.side === "buy" ? "1px solid #ffffffff" : "1px solid #ccc",
              backgroundColor: row.side === "buy" ? "#87ca9eff" : "#ffffffff",
            }}
            onClick={() =>
              setRows((prev) =>
                prev.map((row, index) =>
                  index === i ? { ...row, side: "buy" } : row)
              )}
          >
            購入
          </button>
          <button
            style={{
              padding: "6px 10px",
              border: row.side === "sell" ? "1px solid #ffffffff" : "1px solid #ccc",
              backgroundColor: row.side === "sell" ? "#ff9d9dff" : "#ffffffff",
            }}
            onClick={() =>
              setRows((prev) =>
                prev.map((row, index) =>
                  index === i ? { ...row, side: "sell" } : row)
              )}
          >
            売却
          </button>
          <div>数量：</div>
          <input
            style={{ width: "114px", padding: "6px 10px", border: "1px solid #ccc" }}
            value={row.qty}
            onChange={(e) =>
              /^\d*\.?\d*$/.test(e.target.value) &&
              setRows((prev) =>
                prev.map((r, index) =>
                  index === i ? { ...r, qty: e.target.value } : r
                )
              )
            }
          />
          <div>JPY：</div>
          <input
            style={{ width: "114px", padding: "6px 10px", border: "1px solid #ccc" }}
            value={
              row.jpy === ""
                ? ""
                : Number(row.jpy || "0").toLocaleString()
            }
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, "");
              /^[0-9]*$/.test(raw) &&
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, jpy: raw } : r
                  )
                );
            }}
          />

          <div>手数料：</div>
          <input
            style={{ width: "114px", padding: "6px 10px", border: "1px solid #ccc" }}
            value={
              row.fee === ""
                ? ""
                : Number(row.fee || "0").toLocaleString()
            }
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, "");
              /^[0-9]*$/.test(raw) &&
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, fee: raw } : r
                  )
                );
            }}
          />


          <button
            style={{ padding: "6px 10px", border: "1px solid #ccc" }}
            disabled={rows.length <= 1}
            onClick={() =>
              setRows((prev) => prev.filter((r) => r.id !== row.id))
            }
          >
            削除
          </button>



        </div>

      ))}

      <div style={{ display: "flex", gap: "10px", maxWidth: "320px", margin: "50px auto" }}>
        <button
          style={{ padding: "6px 12px", border: "1px solid #ccc" }}
          onClick={() => {
            for (let i = 0; i < 10; i++) {
              setRows((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  side: null,
                  qty: "",
                  jpy: "",
                  fee: "",
                },
              ])
            };
          }}
        >
          ＋10
        </button>
        <button
          style={{ padding: "6px 12px", border: "1px solid #ccc" }}
          onClick={() => {
            for (let i = 0; i < 5; i++) {
              setRows((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  side: null,
                  qty: "",
                  jpy: "",
                  fee: "",
                },
              ])
            };
          }}
        >
          ＋5
        </button>
        <button
          style={{ padding: "6px 12px", border: "1px solid #ccc" }}
          onClick={async () => {
            setRows((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                side: null,
                qty: "",
                jpy: "",
                fee: "",
              },
            ]);
          }}
        >
          ＋1
        </button>
        <button
          style={{ padding: "6px 12px", border: "1px solid #ccc" }}
          disabled={rows.length <= 1}
          onClick={() => {
            setRows((prev) => {
              // qty / jpy / fee が全部空の行を除外
              const filtered = prev.filter(
                (row) => !(row.qty === "" && row.jpy === "" && row.fee === "")
              );

              // 全部消えたら、空の行を1つだけ残す
              return filtered.length === 0 ? [createEmptyRow()] : filtered;
            });
          }}
        >
          空欄一括削除
        </button>
      </div>

      <button
        style={{ display: "flex", padding: "6px 12px", border: "1px solid #ccc", maxWidth: "190px", margin: "0 auto", marginBottom: "50px", fontSize: "32px" }}
        onClick={() => {
          setShow(true);
          if (!didScrollRef.current) {
            didScrollRef.current = true;
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 0);
          }
          let c = 0;
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].side !== null && rows[i].qty !== "" && rows[i].jpy !== "" && rows[i].fee !== "") {
              c = c + 1
            }
          }
          if (form.isStu !== null && form.salw !== "" && form.b0q !== "" && form.b0v !== "" && c === rows.length && Number(form.b0q) + getBuyQty(rows) !== 0) {
            setError(false)
          }
          else {
            setError(true)
          }

          const newplSum = getSellSum(rows) - (((Number(form.b0v) + getYrBuy(rows)) / (Number(form.b0q) + getBuyQty(rows))) * getSellQty(rows) + getFeeSum(rows));
          setPlSum(newplSum);

          let tax = 0;
          if (newplSum >= 0) {
            if (form.isStu === false) {
              if (0 <= Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 1950000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.05 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
              if (1950000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 3300000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.1 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
              if (3300000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 6950000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.2 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
              if (6950000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 9000000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.23 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
              if (9000000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 18000000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.33 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
              if (18000000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 40000000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.4 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
              if (40000000 < Number(form.salw) * 10000 + newplSum - 580000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.45 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
              if (Number(form.salw) * 10000 + newplSum - 580000 < 0) { tax = 0 }
            }
            else {
              if (Number(form.salw) * 10000 + newplSum > 850000) {
                if (0 <= Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 1950000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.05 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
                if (1950000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 3300000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.1 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
                if (3300000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 6950000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.2 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
                if (6950000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 9000000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.23 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
                if (9000000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 18000000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.33 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
                if (18000000 < Number(form.salw) * 10000 + newplSum - 580000 && Number(form.salw) * 10000 + newplSum - 580000 <= 40000000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.4 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
                if (40000000 < Number(form.salw) * 10000 + newplSum - 580000) { tax = (Number(form.salw) * 10000 + newplSum - 580000) * 0.45 * (newplSum / (newplSum + Number(form.salw) * 10000)) }
                if (Number(form.salw) * 10000 + newplSum - 580000 < 0) { tax = 0 }
              }
              else {
                tax = 0
              }
            }
          }
          else { tax = 0 }
          setResult(tax)
        }}
      >
        計算
      </button>

      {show && (
        <div>
          <div ref={bottomRef} />
          <div style={{ fontSize: "24px", maxWidth: "96px", margin: "0 auto", }}>計算結果</div>
          <div >
            {error === false ?
              (<div style={{ maxWidth: "300px", margin: "10px auto", }}>
                <div style={{ display: "flex" }}>
                  <div>損益合計：</div>
                  <div style={{ color: plSum >= 0 ? "#00b48dff" : "#ff6d33ff" }}>￥{Math.round(plSum).toLocaleString()}</div>
                </div>
                <div style={{ display: "flex" }}>
                  <div>支払う税金：</div>
                  <div>￥{Math.round(result).toLocaleString()}</div>
                </div>
              </div>) :
              (<div style={{ maxWidth: "390px", margin: "10px auto", color: "rgba(253, 72, 72, 1)" }}>エラー：空の入力がある、または計算不可能なデータ</div>)
            }
            <div style={{ marginBottom: "100px" }}></div>
          </div>
        </div>
      )}

    </div>




  );
}