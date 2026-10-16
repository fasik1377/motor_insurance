# UI-to-SQL Server mapping

This is the implementation reference transcribed from `Table Reference.xlsx`. It is a mapping guide, not a database migration.

| UI area | SQL Server table(s) | Notes |
| --- | --- | --- |
| Client / KYC | `Client`, `ClientKYC`, `SubLAccount` | The app's client lookup reads these tables. `SubLAccount` supplies the credit limit. |
| New policy input | `MotorMaster`, `MotorMasterClause`, `MotorMasterAddDet`, `MotorMasterTariffRateOnPolicy` | Create a new-business policy and its clauses, additional details, and current charges. |
| Driver declarations | `MotorMasterOtherDriver`, `MotorMasterConvicted` | Insert only where the corresponding declaration is selected. |
| Accessories / trailers | `MotorProAccMaster`, `MotorMasterTrailer` | Store selected accessories and trailer details. |
| Current policy state | `MotorPro`, `MotorProAddDet`, `MotorProTariffRateOnPolicy`, `MotorProOtherDriver`, `MotorProConvicted`, `MotorProAcc`, `MotorProTrailer` | Update for every new business, renewal, endorsement, or other current-policy change. |
| Rating / premiums | `MotTariffMast`, `MotTariffOthersMast`, `MotTotalLossExcess`, `MotTotalLossVehList`, `MotTariffConfigMast`, `MotTariffClauseMast` | Read-only rating reference used when calculating a premium. |
| Vehicle type / numbering | `VehicleType`, `Department`, `System`, `dbo.GetLatestPolicyCode` | Use `VehicleType` for policy/certificate codes; `Department` for the cover department; obtain the next policy code through the supplied function. |
| Accounting / integrations | `Invoice`, `InvoiceAgent`, `SlTrans`, `GlTrans`, `CertificateReference`, `NTAReference` | Create only after policy issuance/payment according to the insurer's existing transaction rules. |

The OTP feature deliberately uses `WebUsers`, `WebUserSessions`, and `WebOtpCodes`; these hold web identities and do not alter motor-policy or accounting records.
