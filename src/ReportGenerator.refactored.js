// Constantes para eliminar números mágicos
const PRIORITY_THRESHOLD = 1000;
const USER_VALUE_LIMIT = 500;

// Strategy Pattern para diferentes formatos de relatório
/* eslint-disable no-unused-vars */
class ReportFormatter {
  formatHeader(_user) {
    throw new Error('Must implement formatHeader');
  }

  formatItem(_item, _user) {
    throw new Error('Must implement formatItem');
  }

  formatFooter(_total) {
    throw new Error('Must implement formatFooter');
  }
}
/* eslint-enable no-unused-vars */

class CSVFormatter extends ReportFormatter {
  formatHeader() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  formatItem(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  formatFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HTMLFormatter extends ReportFormatter {
  formatHeader(user) {
    return `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>
`;
  }

  formatItem(item) {
    const style = item.priority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  formatFooter(total) {
    return `</table>
<h3>Total: ${total}</h3>
</body></html>
`;
  }
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const formatter = this.getFormatter(reportType);
    const filteredItems = this.filterItemsByUserRole(user, items);
    
    return this.buildReport(formatter, user, filteredItems);
  }

  getFormatter(reportType) {
    const formatters = {
      'CSV': new CSVFormatter(),
      'HTML': new HTMLFormatter()
    };

    return formatters[reportType];
  }

  filterItemsByUserRole(user, items) {
    if (user.role === 'ADMIN') {
      return this.processAdminItems(items);
    }
    
    if (user.role === 'USER') {
      return this.filterItemsByValue(items, USER_VALUE_LIMIT);
    }

    return [];
  }

  processAdminItems(items) {
    return items.map(item => {
      if (item.value > PRIORITY_THRESHOLD) {
        item.priority = true;
      }
      return item;
    });
  }

  filterItemsByValue(items, maxValue) {
    return items.filter(item => item.value <= maxValue);
  }

  buildReport(formatter, user, items) {
    let report = formatter.formatHeader(user);
    let total = 0;

    for (const item of items) {
      report += formatter.formatItem(item, user);
      total += item.value;
    }

    report += formatter.formatFooter(total);
    return report.trim();
  }
}