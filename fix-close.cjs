const fs = require('fs');
let code = fs.readFileSync('src/components/AffiliateModal.tsx', 'utf-8');

// The finally block might close the modal even if auth fails, let's fix the logic
code = code.replace(
  `    } finally {
      setIsSaving(false);
      if (!authError) {
         onClose();
      }
    }`,
  `      onClose(); // only called if successful
    } catch (err) {
      console.warn('Sync error:', err);
      setAuthError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }`
);

fs.writeFileSync('src/components/AffiliateModal.tsx', code);
