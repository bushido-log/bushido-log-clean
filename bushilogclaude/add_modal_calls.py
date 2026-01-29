with open("App.tsx", "r") as f:
    content = f.read()

# プライバシーモーダルの後、</>の前にトーストとPaywallを追加
old1 = """      </Modal>
    </>
  );
}
// =========================
// Styles (complete)"""

new1 = """      </Modal>
      {renderSaveToast()}
      {renderPaywall()}
    </>
  );
}
// =========================
// Styles (complete)"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")