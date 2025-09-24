# 📌 APPROVE – Regras do Projeto

## 🆔 Padrão de IDs
**Formato:** `<ÁREA>-<TELA>.<TASK>`  
- ÁREA: FRONT | BACK | DB | OPS  
- TELA: número da tela/fluxo (do protótipo)  
- TASK: sequência da tarefa naquela tela  

Exemplos: `FRONT-50.01`, `BACK-50.01`, `DB-50.01`.

---

## 📋 Trello
**Listas:** `Backlog` → `A Fazer` → `Em andamento` → `PR` → `Concluído`  
**Labels:** `FRONT`, `BACK`, `DB`, `OPS`, `BUG`  

**Template de card:**
```md
ID: FRONT-50.01
User Story: Como usuário, quero acessar a tela de login para autenticar e usar o sistema.
Critérios de Aceite:
- [ ] Exibir campos email/senha
- [ ] Validar formato de email
- [ ] Botão Entrar só habilita se válido
Notas: link do protótipo
Impacto: front ✅ | back ⬜ | db ⬜
Link PR: ...
````

---

## 🌿 Fluxo de Git

**Regras principais:**

* 1 branch por card.
* PR rascunho no mesmo dia.
* Commits pequenos.
* Sempre rebase (`git rebase origin/main`) para atualizar.
* Merge somente com **squash**.

**Branches:**

```text
feat/FRONT-50.01-login-ui
fix/BACK-21.02-refresh-401
chore/OPS-00.01-ci-pipeline
```

**Commits:**

```text
feat(front): FRONT-50.01 layout base da tela de login
fix(front): FRONT-50.01 validação de email
refactor(db): DB-10.01 renomeia coluna status
```

**Exemplo:**

```bash
# Atualizar main
git checkout main && git pull --ff-only origin main

# Criar branch
git checkout -b feat/FRONT-50.01-login-ui

# Commit
git add frontend/src/pages/Login.vue
git commit -m "feat(front): FRONT-50.01 layout base da tela de login"

# Publicar
git push -u origin feat/FRONT-50.01-login-ui

# Rebase
git fetch origin && git rebase origin/main && git push --force-with-lease

# Merge squash (mensagem final)
# feat(front): FRONT-50.01 tela de login (UI + validação)
```

---

## 📑 Pull Requests

**Template:**

```md
### ID
FRONT-50.01

### O que foi feito
- ...

### Como testar
- ...

### Impacto
front ⬜ | back ⬜ | db ⬜

### Links
Card Trello: ...
Protótipo: ...
```

---

## 👥 Responsáveis por Áreas

| Pasta              | Responsáveis             |
| ------------------ | ------------------------ |
| `/frontend/*`      | @dev-front1, @dev-front2 |
| `/backend/*`       | @dev-back1, @dev-back2   |
| `/db/migrations/*` | @dev-db1, @dev-db2       |

---

## ✅ Regras de Merge e CI

* `main` protegida (sem push direto).
* **Squash merge only**.
* 1 reviewer obrigatório.
* Branch deve estar atualizada antes do merge.

```
