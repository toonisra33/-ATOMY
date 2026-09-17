const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

code = code.replace(
`    } catch (err) {
      console.warn('Sync error:', err);
      setAuthError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      onClose(); // only called if successful
    } catch (err) {
      console.warn('Sync error:', err);
      setAuthError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }`,
`      onClose();
    } catch (err) {
      console.warn('Sync error:', err);
      setAuthError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }`
);

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
